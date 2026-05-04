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
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { login } from "../services/api";

export default function LoginPage() {
  const history = useHistory();

  const [documento, setDocumento] = useState("DOC-DEMO-001");
  const [password, setPassword] = useState("Demo12345*");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");

      const result = await login(documento, password);

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("person", JSON.stringify(result.data.person));

      history.push("/dashboard");
    } catch {
      setError("No se pudo iniciar sesión.");
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>App Attendance</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <h1>Login formador</h1>

            <IonItem>
              <IonLabel position="stacked">Documento</IonLabel>
              <IonInput
                value={documento}
                onIonChange={(event) => setDocumento(event.detail.value || "")}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(event) => setPassword(event.detail.value || "")}
              />
            </IonItem>

            {error && (
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            )}

            <IonButton expand="block" onClick={handleLogin}>
              Iniciar sesión
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}