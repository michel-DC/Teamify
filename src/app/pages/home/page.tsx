"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/_layout/Navbar";
import { Footer } from "@/components/_layout/Footer";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUsers,
  faChartLine,
  faArrowRight,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    title: "Planification",
    description:
      "Organisez vos événements facilement avec notre outil de planification.",
    icon: faCalendarAlt,
  },
  {
    title: "Collaboration",
    description:
      "Travaillez avec votre équipe en temps réel pour une meilleure coordination.",
    icon: faUsers,
  },
  {
    title: "Suivi",
    description:
      "Suivez l'avancement de vos événements et ajustez vos plans en conséquence.",
    icon: faChartLine,
  },
];

export const HomePage = () => {
  return (
    <div>
      <div className="absolute top-0 mb-8 w-full">
        <Navbar />
      </div>
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden rounded-md bg-black/[0.96] antialiased">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
            "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
          )}
        />
        <Spotlight
          className="left-0 -top-40 md:-top-20 md:left-60"
          fill="white"
        />
        <div className="relative z-10 p-8 mx-auto mt-20 w-full max-w-5xl text-center mb-32">
          <h1 className="text-4xl md:text-7xl mt-16 md:mt-32 mb-4 md:mb-6 font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 opacity-0 animate-fadeIn">
            Bienvenue sur{" "}
            <b className="inline-block relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="255"
                height="36"
                viewBox="0 0 255 36"
                fill="none"
                className="inline-block absolute -bottom-2 w-full text-primary -z-10"
              >
                <path
                  d="M2.99975 17.6351C116.771 12.3405 178.178 12.7036 252 18.0966"
                  stroke="currentColor"
                  strokeWidth="5.75696"
                  strokeLinecap="round"
                ></path>
              </svg>
            </b>{" "}
            <b className="inline-block relative text-indigo-500">
              <svg
                className="absolute w-full h-full -z-20 fill-purple-800"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 223 62"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path d="M45.654 53.62c17.666 3.154 35.622 4.512 53.558 4.837 17.94.288 35.91-.468 53.702-2.54 8.89-1.062 17.742-2.442 26.455-4.352 8.684-1.945 17.338-4.3 25.303-7.905 3.94-1.81 7.79-3.962 10.634-6.777 1.38-1.41 2.424-2.994 2.758-4.561.358-1.563-.078-3.143-1.046-4.677-.986-1.524-2.43-2.96-4.114-4.175a37.926 37.926 0 0 0-5.422-3.32c-3.84-1.977-7.958-3.563-12.156-4.933-8.42-2.707-17.148-4.653-25.95-6.145-8.802-1.52-17.702-2.56-26.622-3.333-17.852-1.49-35.826-1.776-53.739-.978-8.953.433-17.898 1.125-26.79 2.22-8.887 1.095-17.738 2.541-26.428 4.616-4.342 1.037-8.648 2.226-12.853 3.676-4.197 1.455-8.314 3.16-12.104 5.363-1.862 1.13-3.706 2.333-5.218 3.829-1.52 1.47-2.79 3.193-3.285 5.113-.528 1.912-.127 3.965.951 5.743 1.07 1.785 2.632 3.335 4.348 4.68 2.135 1.652 3.2 2.672 2.986 3.083-.18.362-1.674.114-4.08-1.638-1.863-1.387-3.63-3.014-4.95-5.09C.94 35.316.424 34.148.171 32.89c-.275-1.253-.198-2.579.069-3.822.588-2.515 2.098-4.582 3.76-6.276 1.673-1.724 3.612-3.053 5.57-4.303 3.96-2.426 8.177-4.278 12.457-5.868 4.287-1.584 8.654-2.89 13.054-4.036 8.801-2.292 17.74-3.925 26.716-5.19C70.777 2.131 79.805 1.286 88.846.723c18.087-1.065 36.236-.974 54.325.397 9.041.717 18.07 1.714 27.042 3.225 8.972 1.485 17.895 3.444 26.649 6.253 4.37 1.426 8.697 3.083 12.878 5.243a42.11 42.11 0 0 1 6.094 3.762c1.954 1.44 3.823 3.2 5.283 5.485a12.515 12.515 0 0 1 1.63 3.88c.164.706.184 1.463.253 2.193-.063.73-.094 1.485-.247 2.195-.652 2.886-2.325 5.141-4.09 6.934-3.635 3.533-7.853 5.751-12.083 7.688-8.519 3.778-17.394 6.09-26.296 7.998-8.917 1.86-17.913 3.152-26.928 4.104-18.039 1.851-36.17 2.295-54.239 1.622-18.062-.713-36.112-2.535-53.824-6.23-5.941-1.31-5.217-2.91.361-1.852"></path>
              </svg>
              <span className="relative z-10">Teamify</span>
            </b>
          </h1>
          <style jsx>{`
            @keyframes fadeIn {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
            .animate-fadeIn {
              animation: fadeIn 1s forwards;
            }
          `}</style>
          <p className="mx-auto mt4 max-w-2xl text-lg text-gray-300">
            Organisez vos événements de manière efficace et collaborative avec
            notre plateforme intuitive.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center mt-8 sm:flex-row">
            <div className="relative w-lg">
              <input
                type="email"
                placeholder="Votre email"
                className="px-5 py-3 w-full text-white bg-gray-800 rounded-r-lg rounded-l-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500"
              />
              <Link href="/auth/register">
                <Button className="absolute top-0 right-0 px-6 py-3 h-full text-white bg-indigo-600 cursor-pointer hover:bg-indigo-700">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
          <div className="z-10 mt-16 text-center">
            <h2 className="text-4xl font-semibold text-gray-200">
              Avec nous vous pourrez :
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-gray-400">
              Découvrez nos outils pour simplifier l'organisation de vos
              événements.
            </p>
            <div className="mt-16 w-full max-w-5xl">
              <div className="grid grid-cols-1 gap-6 mt-8 mb-12 cursor-help md:grid-cols-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-900 rounded-lg border border-gray-800 transition hover:scale-105 hover:border-indigo-500"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 p-2 bg-purple-500 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={feature.icon}
                          className="text-white text-lg"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white ml-4">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-8 max-w-2xl">
                  <h2 className="text-4xl font-bold text-gray-200">
                    Prêt à révolutionner votre gestion d'événements ?
                  </h2>
                  <p className="text-lg text-gray-400">
                    Rejoignez des milliers d'équipes qui ont simplifié leur
                    organisation avec Teamify. Commencez dès aujourd'hui et
                    découvrez une nouvelle façon de collaborer.
                  </p>
                  <Link href="/auth/register">
                    <Button className="px-8 py-4 text-lg px-6 py-3 bg-indigo-600 hover:bg-indigo-800 text-white rounded-lg cursor-pointer p-6">
                      Essayer gratuitement
                    </Button>
                  </Link>
                </div>
                <div className="relative w-full max-w-xl h-96 rounded-lg overflow-hidden">
                  <Image
                    src="/images/illustration/illustration-team.png"
                    alt="Équipe en collaboration"
                    width={500}
                    height={384}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separator className="z-10 my-0.5 bg-white" />
      <div className="bottom-0 w-full z-[999] relative">
        <Footer />
      </div>
    </div>
  );
};
