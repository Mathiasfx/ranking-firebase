"use client";

import { useEffect, useState, Suspense } from "react";
import { ref, onValue, off } from "firebase/database";
import { useSearchParams } from "next/navigation";
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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Settings, Download } from "lucide-react";
import { database } from "@/lib/firebase";
import { FirebaseStatus } from "@/components/firebase-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Usuario {
  id: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  Puntaje: string;
  UID: string;
}

// Función para convertir datos a CSV
function convertToCSV(data: Usuario[]): string {
  // Encabezados CSV - Nombre como primera columna
  const headers = ["Nombre", "Apellido", "Email", "Puntaje", "Posición"];
  
  // Filas de datos - Nombre como primera columna
  const rows = data.map((user, index) => [
    user.Nombre,
    user.Apellido,
    user.Email,
    user.Puntaje,
    (index + 1).toString()
  ]);
  
  // Unir encabezados y filas
  const allRows = [headers, ...rows];
  
  // Convertir a formato CSV usando ";" como separador
  return allRows
    .map(row => 
      row.map(field => {
        // Si el campo contiene punto y coma, comillas o saltos de línea, encerrarlo en comillas
        if (field.includes(';') || field.includes('"') || field.includes('\n')) {
          // Escapar comillas duplicándolas
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(';')
    )
    .join('\n');
}

// Componente para descargar CSV
function DownloadCSV({ usuarios, gameType }: { usuarios: Usuario[], gameType: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleDownload = () => {
    // Verificar contraseña
    if (password !== "admin123") {
      setError("Contraseña incorrecta");
      return;
    }
    
    setError("");
    
    // Convertir a CSV
    const csvContent = convertToCSV(usuarios);
    
    // Crear Blob y enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Configurar y simular clic en enlace de descarga
    link.setAttribute('href', url);
    link.setAttribute('download', `ranking-${gameType}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cerrar diálogo y mostrar notificación
    setIsOpen(false);
    setPassword("");
    toast({
      title: "Descarga iniciada",
      description: `El archivo CSV del ranking de ${gameType} se está descargando.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full h-12 w-12 shadow-lg hover:scale-110 transition-transform" 
          title="Administración"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Descargar Ranking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña de administrador</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Ingrese la contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScoreboardContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const gameType = searchParams.get("game") || "memotest";

  useEffect(() => {
    const usuariosRef = ref(database, `games/${gameType}/usuarios`);

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
              .sort((a, b) => {
                const puntajeA = parseFloat(a.Puntaje) || 0;
                const puntajeB = parseFloat(b.Puntaje) || 0;
                return puntajeB - puntajeA;
              });

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
  }, [gameType]);

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
    <div className="min-h-screen relative" style={{ backgroundColor: "#A5B616" }}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
            Ranking {gameType === "memotest" ? "Memotest" : "Trivia"}
          </h1>
          <p className="text-white/90 drop-shadow">Resultados en tiempo real</p>

          <div className="flex justify-center gap-4">
            <a
              href="/?game=memotest"
              className={`px-6 py-2 rounded-full transition-all ${
                gameType === "memotest"
                  ? "bg-white text-green-800 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Memotest
            </a>
            <a
              href="/?game=trivia"
              className={`px-6 py-2 rounded-full transition-all ${
                gameType === "trivia"
                  ? "bg-white text-green-800 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Trivia
            </a>
          </div>
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
      
      {/* Botón de descarga en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-10">
        <DownloadCSV usuarios={usuarios} gameType={gameType} />
      </div>
    </div>
  );
}

export default function ScoreboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <ScoreboardContent />
    </Suspense>
  );
}
