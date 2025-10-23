import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, FileText, Download, Clock, Star, BookOpen, Video, GraduationCap } from 'lucide-react';
const FormazioneAcademy = () => {
  const videoTutorials = [{
    id: 1,
    title: "Introduzione ai Tour Virtuali",
    duration: "15 min",
    level: "Base",
    thumbnail: "/api/placeholder/300/180",
    youtubeId: "dQw4w9WgXcQ",
    description: "Impara le basi per creare il tuo primo tour virtuale"
  }, {
    id: 2,
    title: "Tecniche di Ripresa Avanzate",
    duration: "22 min",
    level: "Intermedio",
    thumbnail: "/api/placeholder/300/180",
    youtubeId: "dQw4w9WgXcQ",
    description: "Scopri le tecniche professionali per riprese di qualità"
  }, {
    id: 3,
    title: "Post-Produzione e Editing",
    duration: "18 min",
    level: "Avanzato",
    thumbnail: "/api/placeholder/300/180",
    youtubeId: "dQw4w9WgXcQ",
    description: "Master nell'editing e post-produzione dei tour virtuali"
  }, {
    id: 4,
    title: "Marketing per Tour Virtuali",
    duration: "25 min",
    level: "Intermedio",
    thumbnail: "/api/placeholder/300/180",
    youtubeId: "dQw4w9WgXcQ",
    description: "Come promuovere efficacemente i tuoi servizi"
  }];
  const pdfGuides = [{
    id: 1,
    title: "Guida Completa ai Tour Virtuali",
    pages: 45,
    category: "Manuale Base",
    description: "Tutto quello che devi sapere per iniziare nel mondo dei tour virtuali",
    downloadUrl: "#"
  }, {
    id: 2,
    title: "Checklist Pre-Ripresa",
    pages: 8,
    category: "Checklist",
    description: "Lista di controllo per preparare al meglio ogni sessione di ripresa",
    downloadUrl: "#"
  }, {
    id: 3,
    title: "Prezzi e Pacchetti Consigliati",
    pages: 12,
    category: "Business",
    description: "Strategie di pricing e strutturazione dei servizi",
    downloadUrl: "#"
  }, {
    id: 4,
    title: "Specifiche Tecniche Attrezzature",
    pages: 20,
    category: "Tecnico",
    description: "Guida dettagliata su attrezzature e configurazioni raccomandate",
    downloadUrl: "#"
  }];
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Base':
        return 'bg-success/10 text-success border-success/20';
      case 'Intermedio':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Avanzato':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-accent text-accent-foreground border-border';
    }
  };
  const openYouTubeVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };
  return <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formazione & Academy</h1>
          <p className="text-muted-foreground mt-2">
            Migliora le tue competenze con i nostri corsi e tutorial specializzati
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Video className="h-8 w-8 text-metric-blue" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Video Tutorial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Guide PDF</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-metric-violet" />
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-muted-foreground">Contenuti Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Tutorial Esempio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayCircle className="h-6 w-6" />
            <span>Video Tutorial - Esempio</span>
          </CardTitle>
          <CardDescription>
            Esempio di contenuto formativo disponibile nella piattaforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow max-w-md">
            <div className="relative">
              <img src="/assets/images/tour-introduction.png" alt="Introduzione ai Tour Virtuali" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
                <PlayCircle className="h-16 w-16 text-white" />
              </div>
              <Badge className="absolute top-2 right-2 bg-success/10 text-success border-success/20">
                Esempio
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Introduzione ai Tour Virtuali</h3>
              <p className="text-sm text-muted-foreground mb-3">Impara le basi per creare il tuo primo tour virtuale</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>15 min</span>
                </div>
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Esempio
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Guide Esempio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span>Guida PDF - Esempio</span>
          </CardTitle>
          <CardDescription>
            Esempio di contenuto scaricabile disponibile nella piattaforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <FileText className="h-6 w-6 text-error" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Guida Completa ai Tour Virtuali</h3>
                <p className="text-sm text-muted-foreground mb-1">Tutto quello che devi sapere per iniziare nel mondo dei tour virtuali</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <Badge variant="outline">Esempio</Badge>
                  <span>10 pagine</span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center bg-blue-500">
          <Star className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Hai bisogno di supporto personalizzato?</h2>
          <p className="text-muted-foreground mb-6">
            Contattaci per sessioni di formazione one-to-one o consulenze specifiche per il tuo business
          </p>
          <Button size="lg" className="mr-4">
            Richiedi Consulenza
          </Button>
          <Button variant="outline" size="lg">
            Contatta il Supporto
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default FormazioneAcademy;