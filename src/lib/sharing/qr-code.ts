import { toDataURL } from 'qrcode'

export async function generateQRCode(url: string): Promise<string> {
  return toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
  })
}
