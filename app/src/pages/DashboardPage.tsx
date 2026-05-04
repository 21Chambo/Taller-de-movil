import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useEffect, useState } from "react";
import {
  activateSession,
  closeSession,
  createSession,
  getAbsent,
  getEnrollments,
  getInstitutions,
  getPresent,
  getRejections,
  getUnitsByInstitution
} from "../services/api";

type Institution = {
  _id: string;
  name: string;
  code: string;
};

type Unit = {
  _id: string;
  name: string;
  code: string;
  type: string;
};

type SessionData = {
  id: string;
  status: string;
  qrToken?: string;
  qrExpiresAt?: string;
  roomCode?: string;
  publicUrl?: string;
};

export default function DashboardPage() {
  const [token, setToken] = useState("");
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [message, setMessage] = useState("Cargando datos académicos...");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          setMessage("No hay token de sesión. Vuelve al login.");
          return;
        }

        setToken(storedToken);

        const savedSession = localStorage.getItem("activeSession");

        if (savedSession) {
          setSession(JSON.parse(savedSession));
        }

        const institutions = await getInstitutions(storedToken);
        const selectedInstitution = institutions.data[0];

        const units = await getUnitsByInstitution(
          storedToken,
          selectedInstitution._id
        );
        const selectedUnit = units.data[0];

        const enrollments = await getEnrollments(storedToken, selectedUnit._id);

        setInstitution(selectedInstitution);
        setUnit(selectedUnit);

        setMessage(
          `Institución: ${selectedInstitution.name} | Unidad: ${selectedUnit.name} | Inscritos: ${enrollments.data.length}`
        );
      } catch {
        setMessage("Error consultando datos del backend.");
      }
    }

    loadData();
  }, []);

  async function handleCreateSession() {
    try {
      if (!token || !institution || !unit) return;

      const created = await createSession(token, institution._id, unit._id, 10);

      const newSession = {
        id: created.data.id,
        status: created.data.status,
        qrExpiresAt: created.data.qrExpiresAt
      };

      setSession(newSession);
      localStorage.setItem("activeSession", JSON.stringify(newSession));

      setMessage("Sesión creada correctamente.");
      setResults([]);
    } catch {
      setMessage("Error creando sesión.");
    }
  }

  async function handleActivateSession() {
    try {
      if (!token || !session) return;

      const activated = await activateSession(token, session.id);

      const activeSession = {
        id: activated.data.id,
        status: activated.data.status,
        qrToken: activated.data.qrToken,
        qrExpiresAt: activated.data.qrExpiresAt,
        roomCode: activated.data.roomCode,
        publicUrl: activated.data.publicUrl
      };

      setSession(activeSession);
      localStorage.setItem("activeSession", JSON.stringify(activeSession));

      setMessage("Sesión QR activada correctamente.");
      setResults([]);
    } catch {
      setMessage("Error activando sesión.");
    }
  }

  async function handlePresent() {
    try {
      if (!token || !session) return;

      const response = await getPresent(token, session.id);
      setResults(response.data);
      setMessage("Presentes consultados correctamente.");
    } catch {
      setMessage("Error consultando presentes.");
    }
  }

  async function handleAbsent() {
    try {
      if (!token || !session) return;

      const response = await getAbsent(token, session.id);
      setResults(response.data);
      setMessage("Ausentes consultados correctamente.");
    } catch {
      setMessage("Error consultando ausentes.");
    }
  }

  async function handleRejections() {
    try {
      if (!token || !session) return;

      const response = await getRejections(token, session.id);
      setResults(response.data);
      setMessage("Rechazos consultados correctamente.");
    } catch {
      setMessage("Error consultando rechazos.");
    }
  }

  async function handleCloseSession() {
    try {
      if (!token || !session) return;

      const closed = await closeSession(token, session.id);

      const closedSession = {
        ...session,
        status: closed.data.status
      };

      setSession(closedSession);
      localStorage.removeItem("activeSession");

      setMessage("Sesión cerrada correctamente.");
    } catch {
      setMessage("Error cerrando sesión.");
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Panel docente</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <h1>Gestión de asistencia</h1>
            <p>{message}</p>

            {session && (
              <IonText color="primary">
                <p>
                  <strong>Sesión:</strong> {session.id}
                  <br />
                  <strong>Estado:</strong> {session.status}
                  <br />
                  {session.roomCode && (
                    <>
                      <strong>Código de sala:</strong> {session.roomCode}
                      <br />
                    </>
                  )}
                  {session.publicUrl && (
                    <>
                      <strong>URL pública:</strong> {session.publicUrl}
                      <br />
                      <strong>Enlace completo:</strong>{" "}
                      {`http://localhost:5173${session.publicUrl}`}
                      <br />
                    </>
                  )}
                </p>
              </IonText>
            )}

            <IonButton expand="block" onClick={handleCreateSession}>
              Crear sesión QR
            </IonButton>

            <IonButton
              expand="block"
              onClick={handleActivateSession}
              disabled={!session}
            >
              Activar QR
            </IonButton>

            <IonButton expand="block" onClick={handlePresent} disabled={!session}>
              Ver presentes
            </IonButton>

            <IonButton expand="block" onClick={handleAbsent} disabled={!session}>
              Ver ausentes
            </IonButton>

            <IonButton
              expand="block"
              onClick={handleRejections}
              disabled={!session}
            >
              Ver rechazos
            </IonButton>

            <IonButton
              expand="block"
              color="danger"
              onClick={handleCloseSession}
              disabled={!session}
            >
              Cerrar sesión
            </IonButton>
          </IonCardContent>
        </IonCard>

        {results.length > 0 && (
          <IonCard>
            <IonCardContent>
              <h2>Resultados</h2>

              <IonList>
                {results.map((item, index) => (
                  <IonItem key={item.id || item.enrollmentId || index}>
                    <IonLabel>
                      <h3>
                        {item.documento ||
                          item.person?.documento ||
                          "Registro sin documento"}
                      </h3>
                      <p>
                        {item.person?.nombre && `Nombre: ${item.person.nombre}`}
                        {item.status && ` | Estado: ${item.status}`}
                        {item.rejectReason && ` | Motivo: ${item.rejectReason}`}
                      </p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
}