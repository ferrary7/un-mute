/**
 * Helper function to check if the user is authenticated and fetch their data
 * Handles authentication status properly with retries if needed
 */
export async function getUserAuth(maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('/api/users/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      
      if (data?.user?.id) {
        console.log("User authentication confirmed");
        return { user: data.user, isAuthenticated: true };
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.log(`Auth check failed, retry ${retries + 1}/${maxRetries}`);
      retries++;
      
      if (retries >= maxRetries) {
        console.error("Authentication check failed after max retries");
        return { user: null, isAuthenticated: false };
      }
      
      // Wait before trying again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { user: null, isAuthenticated: false };
}
