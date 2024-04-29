import * as fs from 'fs'
import * as Papa from 'papaparse'
import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ApiKey } from '../entities/api-key.entity'
import { Tap } from '../entities/tap.entity'
import { Tag } from '../entities/tag.entity'
import { HashingService } from './hashing.service'

const BATCH_SIZE = 1000
const API_KEYS_COUNT = 10

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name)

  constructor(
    private readonly hashingService: HashingService,
    @InjectRepository(Tap) private readonly tapRepository: Repository<Tap>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async runSeed() {
    await this.seedApiKeys()
    await this.seedTags()
    await this.seedTaps()
  }

  /**
   * Seed Api Keys to DB
   */
  async seedApiKeys() {
    this.logger.log('Seeding Api Keys!')

    // Create array of ints from 1 to API_KEYS_COUNT
    const apiKeyIds = Array.from({ length: API_KEYS_COUNT }, (_, i) => i + 1)

    // Create new Keys and insert in DB
    const newKeys = apiKeyIds.map((teamId) => {
      const newKey = new ApiKey()

      // Generate a new API Key and save only the Hash version to DB
      const plainTextKey = randomBytes(32).toString('hex')
      newKey.key = this.hashingService.hashApiKey(plainTextKey)
      newKey.teamId = teamId

      // Print plain text key only once in script logs
      console.log('Api Key:', plainTextKey, ' team id :', teamId)

      return newKey
    })
    await this.apiKeyRepository.insert(newKeys)
    this.logger.log('Seed Api Keys done.')
  }

  /**
   * Seed Tags to DB
   */
  async seedTags() {
    await this.readAndParseCsv({
      dataType: 'Tags',
      fileName: 'interview-tags.csv',
      createEntity: (data) => {
        const tag = new Tag()
        tag.tagUid = Number(data[0])
        tag.teamId = Number(data[1])
        tag.createdAt = data[2]
        return tag
      },
    }).then((tags: Tag[]) => this.insertInBatches(this.tagRepository, tags))
    this.logger.log('Seed Tags done.')
  }

  /**
   * Seed Taps to DB
   */
  async seedTaps() {
    await this.readAndParseCsv({
      dataType: 'Taps',
      fileName: 'interview-taps.csv',
      createEntity: (data) => {
        const tap = new Tap()
        tap.tagUid = Number(data[1])
        tap.count = Number(data[2])
        tap.createdAt = data[3]
        return tap
      },
    }).then((taps: Tap[]) => this.insertInBatches(this.tapRepository, taps))
    this.logger.log('Seed Taps done.')
  }

  /**
   * Open, Read and Parse the CSV file
   * Constructs the array of entities
   */
  async readAndParseCsv({ dataType, fileName, createEntity }) {
    this.logger.log(`Seeding ${dataType}!`)
    let countCsvRows = 0
    const data = []

    // Open CSV file
    const file = fs.createReadStream(`${process.cwd()}/data/${fileName}`)

    return new Promise((resolve, reject) => {
      // Parse CSV
      Papa.parse(file, {
        worker: true,
        step: (row) => {
          if (!Number(row['data'][0])) return
          countCsvRows += 1

          // Push new entity at every step
          data.push(createEntity(row['data']))
        },
        complete: () => {
          this.logger.log(`Parsing CSV complete. Read ${countCsvRows} records.`)

          // Resolve promise to insert entities in DB
          resolve(data)
        },
        error: reject,
      })
    })
  }

  /**
   * Batch insert entities in DB using BATCH_SIZE
   */
  async insertInBatches(
    repository: Repository<Tap> | Repository<Tag>,
    entities: Tap[] | Tag[],
  ) {
    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const batch = entities.slice(i, i + BATCH_SIZE)
      await repository.insert(batch)
    }
  }
}
