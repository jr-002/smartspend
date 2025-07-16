import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeFinancialRisk } from '@/lib/groq';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { financialData } = req.body;

    if (!financialData) {
      return res.status(400).json({ message: 'Financial data is required' });
    }

    const analysis = await analyzeFinancialRisk(financialData);
    
    // Parse the AI response to extract structured data
    const analysisData = {
      riskPredictions: analysis,
      healthScore: calculateHealthScore(analysis),
    };

    return res.status(200).json(analysisData);
  } catch (error) {
    console.error('Risk Prediction Error:', error);
    return res.status(500).json({ message: 'Error analyzing financial risk' });
  }
}

// Helper function to calculate health score from AI analysis
function calculateHealthScore(analysis: string): number {
  // Extract numerical score from AI analysis or use a default scoring mechanism
  // This is a simplified version - you might want to make this more sophisticated
  try {
    // Look for numerical scores in the AI response
    const scoreMatch = analysis.match(/\b([0-9]{1,3}(?:\.[0-9])?)\b/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
    }
    return 50; // Default score if no numerical score found
  } catch (error) {
    console.error('Error calculating health score:', error);
    return 50; // Default score on error
  }
}
