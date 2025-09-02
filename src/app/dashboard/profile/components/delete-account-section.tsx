"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Shield } from "lucide-react";

interface DeleteAccountSectionProps {
  onDeleteAccount: () => void;
}

export function DeleteAccountSection({
  onDeleteAccount,
}: DeleteAccountSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-red-600">Zone dangereuse</h2>

      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Supprimer mon compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-600 font-medium mb-2">
                  Cette action est irréversible
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Toutes vos données personnelles seront supprimées</li>
                  <li>• Vos organisations et événements seront supprimés</li>
                  <li>• Votre compte sera définitivement fermé</li>
                  <li>• Cette action ne peut pas être annulée</li>
                </ul>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Êtes-vous absolument sûr ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Cette action ne peut pas être annulée. Cela supprimera
                      définitivement votre compte et toutes les données
                      associées.
                    </p>
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 font-medium mb-2">
                        Ce qui sera supprimé :
                      </p>
                      <ul className="text-sm text-red-600 space-y-1">
                        <li>• Votre profil utilisateur</li>
                        <li>• Toutes vos organisations</li>
                        <li>• Tous vos événements</li>
                        <li>• Vos messages et conversations</li>
                        <li>• Vos préférences et paramètres</li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Si vous êtes propriétaire d'organisations, celles-ci
                      seront également supprimées.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    Oui, supprimer mon compte
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-600 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alternatives à la suppression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Avant de supprimer votre compte, considérez ces alternatives :
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-medium">
                  • Désactiver temporairement :
                </span>
                <span>
                  Votre compte sera masqué mais vos données préservées
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">• Transférer la propriété :</span>
                <span>
                  Si vous êtes propriétaire d'organisations, transférez-les à un
                  autre membre
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">• Exporter vos données :</span>
                <span>
                  Téléchargez une copie de vos informations avant la suppression
                </span>
              </li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                Désactiver temporairement
              </Button>
              <Button variant="outline" size="sm">
                Exporter mes données
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
