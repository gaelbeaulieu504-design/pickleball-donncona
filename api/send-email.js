import { createTransport } from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { to, subject, message } = req.body
  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Paramètres manquants: to, subject, message' })
  }

  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) {
    return res.status(500).json({ error: 'EMAIL_USER / EMAIL_PASS non configurés sur le serveur' })
  }

  try {
    const transporter = createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
    await transporter.sendMail({
      from: `"Pickleball Donnacona" <${user}>`,
      to,
      subject,
      html: message.replace(/\n/g, '<br>'),
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: err.message })
  }
}