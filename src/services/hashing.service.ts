import { createHash } from 'crypto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class HashingService {
  hashApiKey(apiKey: string): string {
    // Would use stronger algorithms such as bcrypt or argon2
    const hash = createHash('sha512')
    hash.update(apiKey)
    return hash.digest('hex')
  }
}
