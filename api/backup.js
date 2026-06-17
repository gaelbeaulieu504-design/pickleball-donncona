import { exportAllData, importAllData, restoreFromBackup, listBackups } from '../server/_storage.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET /api/backup → export all data as downloadable JSON
    const data = await exportAllData()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`)
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { action, key } = req.body || {}

    if (action === 'restore' && key) {
      const ok = await restoreFromBackup(key)
      return res.json({ success: ok, message: ok ? `${key} restauré depuis le backup` : `Aucun backup trouvé pour ${key}` })
    }

    if (action === 'import' && req.body.data) {
      const results = await importAllData(req.body.data)
      return res.json({ success: true, results })
    }

    if (action === 'list') {
      const backups = await listBackups()
      return res.json({ success: true, backups })
    }

    return res.status(400).json({ error: 'Action invalide. Utilisez GET pour exporter, POST avec action=restore&key=X ou action=import&data=X' })
  }

  res.status(405).end()
}