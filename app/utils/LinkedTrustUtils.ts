interface LinkedTrustUtilsOptions {
  showNotification: (message: string, severity: 'success' | 'error') => void
  email: string
}

export const createLinkedTrustUtils = (options: LinkedTrustUtilsOptions) => {
  const { showNotification, email } = options

  const handleLinkedTrustShare = async (claim: any) => {
    claim = {
      ...claim,
      id: claim.id.id ? claim.id.id : claim.id,
      email
    }

    try {
      const response = await fetch('https://dev.linkedtrust.us/api/credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claim)
      })

      if (response.status === 409) {
        throw new Error('Credential already exists in LinkedTrust')
      }

      if (!response.ok) {
        throw new Error('Failed to share with LinkedTrust')
      }

      showNotification('Successfully shared with LinkedTrust', 'success')
      linkedtrustMagicLink()
    } catch (error: any) {
      console.error('Error sharing with LinkedTrust:', error)
      showNotification(error.message || 'Failed to share with LinkedTrust', 'error')
    }
  }

  const linkedtrustMagicLink = async () => {
    try {
      const response = await fetch(`/api/linkdtrustauth`)
      const { data } = await response.json()

      if (data?.accessToken && data?.refreshToken) {
        const authURL = `https://dev.linkedtrust.us/login?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`

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
