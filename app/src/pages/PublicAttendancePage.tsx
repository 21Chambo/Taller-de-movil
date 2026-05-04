import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicAttendance,
  registerPublicAttendance
} from "../services/api";

type Params = {
  token: string;
};

export default function PublicAttendancePage() {
  const { token } = useParams<Params>();

  const [documento, setDocumento] = useState("EST-DEMO-001");
  const [sessionStatus, setSessionStatus] = useState("Consultando sesión...");
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await getPublicAttendance(token);

        setSessionStatus(response.data.status);
        setRoomCode(response.data.roomCode || "");
      } catch {
        setSessionStatus("Sesión no disponible");
      }
    }

    loadSession();
  }, [token]);

  async function handleRegister() {
    try {
      setMessage("");

      const response = await registerPublicAttendance(token, documento);

      setMessage(`Asistencia registrada correctamente: ${response.data.status}`);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Error registrando asistencia.");
      }
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registro de asistencia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <h1>Asistencia por QR</h1>

            <p>
              Esta pantalla permite al estudiante registrar su asistencia usando
              el QR temporal de la sesión.
            </p>

            <IonText color="primary">
              <p>
                <strong>Estado de sesión:</strong> {sessionStatus}
                <br />
                {roomCode && (
                  <>
                    <strong>Código de sala:</strong> {roomCode}
                  </>
                )}
              </p>
            </IonText>

            <IonItem>
              <IonLabel position="stacked">Documento</IonLabel>
              <IonInput
                value={documento}
                placeholder="EST-DEMO-001"
                onIonChange={(event) => setDocumento(event.detail.value || "")}
              />
            </IonItem>

            <IonButton expand="block" onClick={handleRegister}>
              Registrar asistencia
            </IonButton>

            {message && (
              <IonText color="medium">
                <p>{message}</p>
              </IonText>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}