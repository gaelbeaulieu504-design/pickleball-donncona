import { getCourses, setCourses } from '../server/_storage.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET — list all courses
  if (req.method === 'GET') {
    const courses = await getCourses()
    return res.status(200).json(courses)
  }

  // POST — register for a course
  if (req.method === 'POST') {
    const { courseId, userName, userEmail, userId, paymentInfo } = req.body
    if (!courseId || !userName || !userEmail) {
      return res.status(400).json({ error: 'Paramètres manquants' })
    }
    const courses = await getCourses()
    const idx = courses.findIndex(c => c.id === courseId)
    if (idx === -1) return res.status(404).json({ error: 'Cours introuvable' })
    const course = courses[idx]
    if (course.registrations.find(r => r.email === userEmail)) {
      return res.status(400).json({ error: 'Vous êtes déjà inscrit à ce cours' })
    }
    if (course.maxParticipants && course.registrations.length >= course.maxParticipants) {
      return res.status(400).json({ error: 'Ce cours est complet' })
    }
    course.registrations.push({
      userId: userId || null,
      name: userName,
      email: userEmail,
      registeredAt: new Date().toISOString(),
      paymentInfo: paymentInfo || null,
    })
    courses[idx] = course
    await setCourses(courses)
    return res.status(200).json({ success: true, course })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
