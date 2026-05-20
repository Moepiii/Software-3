package database

import (
    "context"

    "Backend/prisma/db"
)

var Client *db.PrismaClient

var Personas = db.Personas
var Empresas = db.Empresas
var ErrNotFound = db.ErrNotFound

func Connect() error {
    Client = db.NewClient()
    if err := Client.Prisma.Connect(); err != nil {
        return err
    }
    // Test connection
    var res interface{}
    if err := Client.Prisma.QueryRaw("SELECT 1").Exec(context.Background(), &res); err != nil {
        return err
    }
    return nil
}

func Close() {
    if Client != nil {
        _ = Client.Prisma.Disconnect()
    }
}