export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const isProd = process.env.NODE_ENV === 'production';
  const clear = (name, path='/') => `${name}=; HttpOnly; Path=${path}; Max-Age=0; SameSite=Lax${isProd?'; Secure':''}`;
  res.setHeader('Set-Cookie', [clear('access_token','/'), clear('refresh_token','/api/auth')]);
  res.status(200).json({ success: true });
}
