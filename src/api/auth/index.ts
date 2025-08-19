export function refreshAccessToken(
  refreshToken: string
): Promise<void> {
  console.log(refreshToken)
  return new Promise((resolve, _) => {
    setTimeout(() => resolve, 5000)
  })
}
