const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export type LoginResponse = {
  data: {
    token: string;
    person: {
      id: string;
      institutionId: string;
      nombre: string;
      documento: string;
      roles: string[];
    };
  };
};

export async function login(
  documento: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ documento, password })
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas o API no disponible");
  }

  return response.json();
}

export async function getInstitutions(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/academic/institutions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("No se pudieron consultar las instituciones");
  }

  return response.json();
}

export async function getUnitsByInstitution(
  token: string,
  institutionId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/academic/institutions/${institutionId}/units`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar las unidades académicas");
  }

  return response.json();
}

export async function getEnrollments(token: string, unitId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/academic/units/${unitId}/enrollments`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los inscritos");
  }

  return response.json();
}

export async function createSession(
  token: string,
  institutionId: string,
  unitId: string,
  qrTtlMinutes = 10
) {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      institutionId,
      unitId,
      qrTtlMinutes
    })
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la sesión");
  }

  return response.json();
}

export async function activateSession(token: string, sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/activate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        qrTtlMinutes: 10
      })
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo activar la sesión");
  }

  return response.json();
}

export async function getPresent(token: string, sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/present`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los presentes");
  }

  return response.json();
}

export async function getAbsent(token: string, sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/absent`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los ausentes");
  }

  return response.json();
}

export async function getRejections(token: string, sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/rejections`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los rechazos");
  }

  return response.json();
}

export async function closeSession(token: string, sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/close`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo cerrar la sesión");
  }

  return response.json();
}

export async function getPublicAttendance(token: string) {
  const response = await fetch(`${API_BASE_URL}/attendance/${token}`);

  if (!response.ok) {
    throw new Error("No se pudo consultar la sesión pública");
  }

  return response.json();
}

export async function registerPublicAttendance(
  token: string,
  documento: string
) {
  const response = await fetch(
    `${API_BASE_URL}/public/attendance/${token}/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ documento })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "No se pudo registrar asistencia");
  }

  return result;
}