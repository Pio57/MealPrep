# 🚦 Routing con react-router-dom

Invece di utilizzare atomi globali per simulare il routing, utilizziamo **`react-router-dom`** per garantire URL reali, cronologia di navigazione integrata ed un'architettura standard a livello di produzione.

---

## Definizione delle Rotte (`App.tsx`)

Avvolgere l'applicazione in `<BrowserRouter>`, definire le rotte tramite `<Routes>` e `<Route>` ed inserire un reindirizzamento sicuro di fallback:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginScreenLoader } from "./Core/features/Login/ScreenLoader/LoginScreenLoader";
import { InvoiceScreenLoader } from "./Core/features/Invoices/ScreenLoader/InvoiceScreenLoader";

function App() {
  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreenLoader />} />
          <Route path="/invoices" element={<InvoiceScreenLoader />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
```

---

## Navigazione Programmatica nel Controller

Utilizzare l'hook `useNavigate()` nei controller per innescare i reindirizzamenti a seguito di operazioni asincrone andate a buon fine (es. dopo il Login):

```typescript
import { useNavigate } from "react-router-dom";

export const useLoginController = () => {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await loginMutation.mutateAsync(credentials);
      navigate("/invoices"); // Reindirizzamento a successo avvenuto
    } catch (error) {
      console.error(error);
    }
  };
  // ...
};
```

> **Nota**: `useNavigate` deve essere chiamato solo nei Controller (custom hook) o nello ScreenLoader, mai direttamente nella View. La View riceve la callback di navigazione come prop (es. `onBackToLogin`).

---

## Rotte Protette e Gestione dei Ruoli (`ProtectedRoute`)

Il componente `ProtectedRoute` deve essere utilizzato per proteggere le rotte dell'applicazione, imponendo regole di autenticazione e autorizzazione.

### Linee Guida per `ProtectedRoute`
1. **Parametri Obbligatori**: `ProtectedRouteProps` deve imporre come obbligatori i parametri `allowedRoles` (i ruoli abilitati ad accedere, es. `AppRole[]`) e `redirectTo` (la rotta di fallback/reindirizzamento in caso di fallimento della validazione). Non devono essere inseriti valori di default o fallback interni alla logica del componente per forzare chi dichiara la rotta ad esplicitare questi comportamenti.
2. **Raggruppamento e Nidificazione**: Per evitare ridondanza ed evitare di avvolgere singolarmente ogni rotta con `<ProtectedRoute><MainLayout>...</MainLayout></ProtectedRoute>`, le rotte con gli stessi requisiti di autorizzazione devono essere raggruppate sotto un'unica rotta di layout comune che renderizza l'elemento `<ProtectedRoute>` e `<MainLayout>` appoggiandosi a `<Outlet />` di `react-router-dom`:

```tsx
{/* Rotte ad accesso esclusivo per Admin */}
<Route element={<ProtectedRoute allowedRoles={["admin_aziendale", "super_admin"]} redirectTo="/dashboard" />}>
  <Route element={<MainLayout />}>
    <Route path="/clienti" element={<Clienti />} />
    <Route path="/kpi-clienti" element={<KpiClienti />} />
  </Route>
</Route>
```
