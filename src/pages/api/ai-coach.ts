import { NextApiRequest, NextApiResponse } from 'next';
import { generateFinancialAdvice } from '@/lib/groq';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userContext } = req.body;

    if (!userContext) {
      return res.status(400).json({ message: 'User context is required' });
    }

    const advice = await generateFinancialAdvice(userContext);
    return res.status(200).json({ advice });
  } catch (error) {
    console.error('AI Coach Error:', error);
    return res.status(500).json({ message: 'Error generating financial advice' });
  }
}
