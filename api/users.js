import { getUsers } from '../server/_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const users = await getUsers()
  res.json(users.map(({ password, ...u }) => u))
}
