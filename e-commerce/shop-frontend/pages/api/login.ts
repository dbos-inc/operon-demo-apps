import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { api } from '@/lib/backend';
import { ResponseError } from '@/client';

export async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    await api.login({ loginRequest: { username, password}})
    req.session.user = username;
    await req.session.save();
    return res.status(200).json({ message: 'User logged in successfully' });
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error(error.message);
      return res.status(error.response.status).json({ message: error.message })
    } else {
      console.error(error);
      throw error;
    }
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions);