import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Generate RSA Key Pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1', // or 'spki'
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs1', // or 'pkcs8'
        format: 'pem'
    }
})

// Log keys
console.log('Private Key:\n', privateKey)
console.log('Public Key:\n', publicKey)

// Ensure certs folder exists
const certsDir = path.resolve('certs')
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir)
}

// Write keys to files
fs.writeFileSync(path.join(certsDir, 'private.pem'), privateKey)
fs.writeFileSync(path.join(certsDir, 'public.pem'), publicKey)
