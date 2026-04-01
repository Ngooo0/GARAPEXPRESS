@startuml GarapExpress_Diagramme_Deploiement

!theme plain
hide stereotype

skinparam componentStyle uml2

actor "Client Mobile\n(Utilisateur)" as MobileClient << Utilisateur >>
actor "Pharmacie" as Pharmacie << Utilisateur >>
actor "Livreur" as Rider << Utilisateur >>
actor "Administrateur" as Admin << Utilisateur >>

node "Zone Client" {
    component "App Mobile\n(Expo/React Native)" as MobileApp
}

node "Zone Cloud - Services Externes" {
    component "Serveur SMS\n(Twilio)" as SMSService
    component "Service Email\n(SMTP)" as EmailService
}

cloud "Cloud Provider" {
    node "Render.com - Backend Service" {
        component "Node.js 22.22.0\nAPI Server" as BackendAPI
        component "WebSocket Server\n(Socket.io)" as WebSocket
        component "Middleware\n(Auth, Upload, CORS)" as Middleware
    }

    database "MySQL Database\n(PlanetScale)" as Database {
        storage "Tables: utilisateurs\npharmacies, commandes,\nlivraisons, evaluations"
    }

    storage "Stockage Fichiers\n(Images, Uploads)" as FileStorage
}

MobileClient -down-> BackendAPI : HTTPS/REST
Pharmacie -down-> BackendAPI : HTTPS/REST
Rider -down-> BackendAPI : HTTPS/REST
Admin -down-> BackendAPI : HTTPS/REST

MobileClient -down-> WebSocket : WebSocket\n(Temps réel)
Rider -down-> WebSocket : WebSocket\n(Temps réel)

BackendAPI -down-> Database : Prisma ORM\n(MySQL Protocol)
BackendAPI -down-> FileStorage : Upload/Download\n(Files)
BackendAPI -left-> SMSService : API REST\n(Notifications SMS)
BackendAPI -right-> EmailService : SMTP\n(Notifications Email)

note right of BackendAPI
  Ports:
  - 443 (HTTPS)
  - 10000 (WebSocket)
end note

note right of Database
  Hébergé sur:
  PlanetScale (MySQL)
  Connection via
  Prisma Client
end note

@enduml