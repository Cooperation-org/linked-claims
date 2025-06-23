interface LinkedTrustUtilsOptions {
  showNotification: (message: string, severity: 'success' | 'error') => void
  email: string
}

interface LinkedTrustResponse {
  credential: any
  uri: string
  schema?: string
  claimUrl: string
  message?: string
  instructions?: any
}

interface AuthData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export const createLinkedTrustUtils = (options: LinkedTrustUtilsOptions) => {
  const { showNotification, email } = options

  // Cache for auth data with expiration
  let cachedAuthData: AuthData | null = null

  const getAuthData = async (): Promise<AuthData> => {
    const now = Date.now()

    // Check if we have valid cached data (not expired)
    if (cachedAuthData && cachedAuthData.expiresAt > now) {
      return cachedAuthData
    }

    // Fetch new auth data
    try {
      const response = await fetch(`/api/linkdtrustauth`)
      const { data } = await response.json()

      // Cache the data with 1 hour expiration (minus 5 minutes for safety buffer)
      cachedAuthData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: now + 55 * 60 * 1000 // 55 minutes from now
      }

      return cachedAuthData
    } catch (error) {
      console.error('Error fetching authentication data:', error)
      throw new Error('Failed to authenticate with LinkedTrust')
    }
  }

  const handleLinkedTrustShare = async (claim: any) => {
    claim = {
      ...claim,
      id: claim.id.id ? claim.id.id : claim.id,
      email
    }

    try {
      const authData = await getAuthData()
      const baseUrl =
        process.env.NEXT_PUBLIC_LINKEDTRUST_API_URL || 'https://linkedtrust.us'
      const response = await fetch(`${baseUrl}/api/credentials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claim)
      })

      if (response.status === 409) {
        // Credential already exists - still get the response for the claimUrl
        const data: LinkedTrustResponse = await response.json()
        if (data.claimUrl) {
          showNotification('Credential already exists. Opening claim page...', 'success')
          setTimeout(() => {
            window.open(data.claimUrl, '_blank')
          }, 1000)
          return
        }
        throw new Error('Credential already exists in LinkedTrust')
      }

      if (!response.ok) {
        throw new Error('Failed to share with LinkedTrust')
      }

      const data: LinkedTrustResponse = await response.json()

      // Fallback to old magic link approach if no claimUrl
      showNotification('Successfully shared with LinkedTrust', 'success')
      linkedtrustMagicLink()
    } catch (error: any) {
      console.error('Error sharing with LinkedTrust:', error)
      showNotification(error.message || 'Failed to share with LinkedTrust', 'error')
    }
  }

  const linkedtrustMagicLink = async () => {
    try {
      const authData = await getAuthData()

      if (authData?.accessToken && authData?.refreshToken) {
        const baseUrl =
          process.env.NEXT_PUBLIC_LINKEDTRUST_URL || 'https://linkedtrust.us'
        const authURL = `${baseUrl}/login?accessToken=${authData.accessToken}&refreshToken=${authData.refreshToken}`

        // Create a hidden anchor element to leverage user gesture
        const linkElem = document.createElement('a')
        linkElem.href = authURL
        linkElem.target = '_blank'
        linkElem.style.display = 'none'
        document.body.appendChild(linkElem)

        // Use click event to open window
        linkElem.click()

        // Clean up the element
        setTimeout(() => {
          document.body.removeChild(linkElem)
        }, 100)
      } else {
        console.error('Access token or refresh token is missing.')
        showNotification('Authentication failed. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error fetching authentication data:', error)
      showNotification('Failed to authenticate with LinkedTrust', 'error')
    }
  }

  return {
    handleLinkedTrustShare
  }
}
