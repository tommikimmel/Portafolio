import { useState } from "react";
import heroImage from "../assets/image/heroImage.webp";

function Hero() {
    return(
        <section className="h-screen grid grid-cols-2 min-f-screen">
            {/* Parte de texto */}
            <div className="bg-[var(--color-gris-oscuro)] flex flex-col items-center justify-center h-full w-full ">
                <p className="text-[var(--color-rosa)]">Soy desarrollador Full Stack</p>
                <h1 className="text-gray-200 text-6xl font-bold mb-4 text-center">¡Hola, soy Tomas!</h1>
                <p className="text-[var(--color-rosa)]">Ofrezco soluciones no código</p>
                <a href="#proyectos" className="bg-gray-200 text-[var(--color-rosa)] py-2 px-4  transition mt-4 rounded-3xl hover:bg-[var(--color-rosa-hover)] hover:text-gray-200">Ver Proyectos</a>
            </div>

            {/* Parte de imagen */}
            <div className="bg-[var(--color-rosa)] h-full w-full overflow-hidden">
                <img src={heroImage} className="w-full h-full object-cover object-center"/>
            </div>
        </section>
    )
}

export default Hero;