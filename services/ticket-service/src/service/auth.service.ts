
import axios from "axios";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthUserResponse {
  success: boolean;
  user: AuthUser;
}

interface AuthUsersResponse {
  success: boolean;
  users: AuthUser[];
}

const getAuthConfig = () => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL;
  const internalKey = process.env.INTERNAL_SERVICE_KEY;

  if (!authServiceUrl || !internalKey) {
    throw new Error("AUTH_SERVICE_CONFIG_MISSING");
  }

  return {
    authServiceUrl,
    headers: {
      "x-internal-key": internalKey,
    },
    timeout: 5000,
  };
};

// Get a user by ID
export const getUserById = async (
  userId: string
): Promise<AuthUser> => {
  const config = getAuthConfig();

  try {
    const response = await axios.get<AuthUserResponse>(
      `${config.authServiceUrl}/internal/users/${encodeURIComponent(userId)}`,
      {
        headers: config.headers,
        timeout: config.timeout,
      }
    );

    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("USER_NOT_FOUND");
    }

    throw new Error("AUTH_SERVICE_UNAVAILABLE");
  }
};

// Get admin users available for ticket assignment
export const getAllAdmins = async (): Promise<AuthUser[]> => {
  const config = getAuthConfig();

  try {
    const response = await axios.get<AuthUsersResponse>(
      `${config.authServiceUrl}/internal/admins`,
      {
        headers: config.headers,
        timeout: config.timeout,
      }
    );

    return response.data.users;
  } catch {
    throw new Error("AUTH_SERVICE_UNAVAILABLE");
  }
};
