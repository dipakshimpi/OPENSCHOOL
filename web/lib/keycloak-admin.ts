/**
 * Keycloak Admin API Helper
 * This is used to create users programmatically from our custom UI.
 */

export async function getKeycloakAdminToken() {
    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.KEYCLOAK_CLIENT_ID!,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Keycloak Admin Token Error:", err);
        throw new Error("Failed to get Keycloak Admin Token. Check if Service Accounts are enabled.");
    }

    const data = await response.json();
    return data.access_token;
}

export async function createKeycloakUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}) {
    const token = await getKeycloakAdminToken();

    const realmName = process.env.KEYCLOAK_ISSUER?.split('/').pop();
    const adminBaseURL = process.env.KEYCLOAK_ISSUER?.replace(`/realms/${realmName}`, `/admin/realms/${realmName}`);

    // 1. Create the user profile
    console.log(`[Keycloak] Step 1: Creating user profile for ${userData.email}...`);
    const createResponse = await fetch(`${adminBaseURL}/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: userData.email,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            enabled: true,
            emailVerified: true
        })
    });

    if (!createResponse.ok) {
        const error = await createResponse.json().catch(() => ({ message: createResponse.statusText }));
        throw new Error(error.errorMessage || error.message || "Failed to create user in Keycloak");
    }

    // Keycloak returns the new user's ID in the Location header
    const location = createResponse.headers.get('Location');
    const keycloakId = location?.split('/').pop();

    if (!keycloakId) {
        throw new Error("User created but Keycloak ID not found in response headers");
    }

    // 2. Explicitly set the password (more reliable than doing it in Step 1)
    console.log(`[Keycloak] Step 2: Setting password for user ID ${keycloakId}...`);
    const passwordResponse = await fetch(`${adminBaseURL}/users/${keycloakId}/reset-password`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'password',
            value: userData.password,
            temporary: false
        })
    });

    if (!passwordResponse.ok) {
        const error = await passwordResponse.json().catch(() => ({ message: passwordResponse.statusText }));
        throw new Error("User was created but password could not be set: " + (error.errorMessage || error.message));
    }

    console.log(`[Keycloak] Success: User ${userData.email} created and password set.`);
    return keycloakId;
}
