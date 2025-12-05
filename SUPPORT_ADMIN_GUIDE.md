# Guide d'Administration du Support - AutoEcoli

## Vue d'ensemble

Ce document explique comment accéder et gérer les demandes de support soumises via le formulaire de contact du site AutoEcoli.

## Collection Firestore: `support`

Toutes les demandes de support sont enregistrées dans la collection Firebase Firestore nommée **`support`**.

### Structure des documents

Chaque soumission de formulaire crée un nouveau document avec les champs suivants:

```javascript
{
  fullName: string,          // Nom complet de l'utilisateur
  email: string,             // Email de contact
  subject: string,           // Sujet de la demande
  message: string,           // Message détaillé
  status: string,            // Statut: "pending", "in-progress", "resolved"
  createdAt: Timestamp,      // Date et heure de création
  language: string           // Langue de soumission ("fr" ou "ar")
}
```

### Valeurs possibles pour `subject`:
- `general` - Question générale
- `technical` - Problème technique
- `partnership` - Partenariat auto-école
- `candidateSupport` - Support candidat
- `other` - Autre

## Comment accéder aux demandes de support (Firebase Console)

### Méthode 1: Via Firebase Console

1. **Accéder à Firebase Console**
   - Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Connectez-vous avec votre compte Google

2. **Sélectionner le projet**
   - Trouvez et cliquez sur le projet **AutoEcoli**

3. **Accéder à Firestore Database**
   - Dans le menu latéral, cliquez sur **"Firestore Database"**
   - Vous verrez la liste des collections

4. **Ouvrir la collection support**
   - Cliquez sur la collection **`support`**
   - Vous verrez tous les documents (demandes de support)

5. **Consulter une demande**
   - Cliquez sur un document pour voir tous les détails
   - Vous pouvez voir:
     - Le nom et l'email de l'utilisateur
     - Le sujet et le message
     - La date de soumission
     - Le statut actuel

### Méthode 2: Créer une page d'administration

Pour un accès plus convivial, vous pouvez créer une page d'administration dans votre projet AutoEcoli avec les fonctionnalités suivantes:

#### Fonctionnalités recommandées:
- ✅ Liste de toutes les demandes de support
- ✅ Filtrage par statut (pending, in-progress, resolved)
- ✅ Filtrage par sujet
- ✅ Recherche par nom ou email
- ✅ Tri par date
- ✅ Changement de statut
- ✅ Réponse directe par email

## Gestion des statuts

Il est recommandé de mettre à jour le statut des demandes:

- **pending**: Nouvelle demande non traitée
- **in-progress**: Demande en cours de traitement
- **resolved**: Demande résolue

Pour mettre à jour le statut dans Firebase Console:
1. Cliquez sur le document
2. Cliquez sur le champ `status`
3. Modifiez la valeur
4. Cliquez sur "Update"

## Notifications par email (Optionnel)

Pour recevoir des notifications par email lorsqu'une nouvelle demande est soumise, vous pouvez:

### Option 1: Utiliser Firebase Extensions
1. Installer l'extension "Trigger Email"
2. Configurer pour envoyer un email à chaque nouveau document dans `support`

### Option 2: Utiliser Firebase Cloud Functions
Créer une fonction qui s'exécute lors de la création d'un nouveau document:

```javascript
exports.notifyNewSupport = functions.firestore
  .document('support/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    // Envoyer email à l'admin
    // Code d'envoi d'email ici
  });
```

## Répondre aux demandes

Pour répondre à une demande:

1. Notez l'adresse email de l'utilisateur
2. Envoyez votre réponse directement à cet email
3. Une fois résolu, mettez à jour le statut à "resolved"

## Exemples de requêtes Firestore

### Obtenir toutes les demandes en attente
```javascript
const pendingRequests = await getDocs(
  query(collection(db, "support"), where("status", "==", "pending"))
);
```

### Obtenir les demandes par sujet
```javascript
const technicalRequests = await getDocs(
  query(collection(db, "support"), where("subject", "==", "technical"))
);
```

### Obtenir les demandes récentes (dernières 24h)
```javascript
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const recentRequests = await getDocs(
  query(
    collection(db, "support"), 
    where("createdAt", ">=", yesterday),
    orderBy("createdAt", "desc")
  )
);
```

## Sécurité et règles Firestore

**Important**: Assurez-vous que les règles Firestore permettent:
- ✅ La création de documents par les utilisateurs publics
- ❌ Empêcher la lecture/modification par des utilisateurs non-administrateurs

Exemple de règles recommandées:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /support/{document} {
      // Permettre la création pour tous
      allow create: if true;
      
      // Lecture et modification uniquement pour les admins
      allow read, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
  }
}
```

## Statistiques utiles

Vous pouvez suivre:
- Nombre total de demandes
- Demandes par statut
- Demandes par sujet
- Temps de résolution moyen
- Demandes par période (jour/semaine/mois)

## Support technique

Pour toute question concernant l'accès ou la gestion des demandes de support:
- **Email technique**: autooecoli@gmail.com
- **Documentation Firebase**: [https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)

---

**Date de création**: ${new Date().toLocaleDateString('fr-FR')}
**Version**: 1.0
