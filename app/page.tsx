"use client";

import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { database } from "@/lib/firebase";
import { FirebaseStatus } from "@/components/firebase-status";

interface Usuario {
  id: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  Puntaje: string;
  UID: string;
}

export default function ScoreboardPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usuariosRef = ref(database, "usuarios");

    const unsubscribe = onValue(
      usuariosRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const usuariosArray: Usuario[] = Object.entries(data)
              .filter(
                ([key, value]) => key !== "Puntaje" && typeof value === "object"
              )
              .map(([id, userData]) => ({
                id,
                ...(userData as Omit<Usuario, "id">),
              }))
              .sort(
                (a, b) =>
                  Number.parseInt(b.Puntaje) - Number.parseInt(a.Puntaje)
              );

            setUsuarios(usuariosArray);
          } else {
            setUsuarios([]);
          }
          setLoading(false);
        } catch (err) {
          setError("Error al cargar los datos");
          setLoading(false);
        }
      },
      (error) => {
        setError("Error de conexión con Firebase");
        setLoading(false);
      }
    );

    return () => off(usuariosRef, "value", unsubscribe);
  }, []);

  const topScore =
    usuarios.length > 0 ? Number.parseInt(usuarios[0].Puntaje) : 0;
  const averageScore =
    usuarios.length > 0
      ? Math.round(
          usuarios.reduce(
            (sum, user) => sum + Number.parseInt(user.Puntaje),
            0
          ) / usuarios.length
        )
      : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando puntajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#A5B616" }}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
            Ranking Class
          </h1>
          <p className="text-white/90 drop-shadow">Resultados en tiempo real</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Clasificación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="text-right">Puntaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No hay datos disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      usuarios.map((usuario, index) => (
                        <TableRow
                          key={usuario.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {index + 1}
                              {index === 0 && (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              )}
                              {index === 1 && (
                                <Trophy className="h-4 w-4 text-gray-400" />
                              )}
                              {index === 2 && (
                                <Trophy className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {usuario.Nombre}
                          </TableCell>
                          <TableCell>{usuario.Apellido}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {usuario.Email}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={index < 3 ? "default" : "secondary"}
                              className="font-mono text-lg px-3 py-1"
                            >
                              {usuario.Puntaje}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sm:hidden space-y-2">
          <h3 className="text-lg font-semibold text-white drop-shadow">
            Emails de Participantes
          </h3>
          <div className="grid gap-2">
            {usuarios.map((usuario, index) => (
              <Card key={`email-${usuario.id}`} className="p-3 bg-white/95">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {index + 1}. {usuario.Nombre} {usuario.Apellido}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {usuario.Puntaje}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {usuario.Email}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
