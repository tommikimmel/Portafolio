function Contact(){
    return (
        <section className="bg-[var(--color-gris-claro)] text-gray-200 p-6 min-h-screen flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-5 border-b border-[var(--color-rosa)]">Contáctame</h2>
            <form className="flex flex-col space-y-4">
                <input type="text" placeholder="Tu nombre" className="p-2 rounded bg-[var(--color-gris-oscuro)] border border-gray-700 outline-none"></input>
                <input type="email" placeholder="Tu email" className="p-2 rounded bg-[var(--color-gris-oscuro)] border border-gray-700 outline-none"></input>
                <textarea placeholder="Tu mensaje" className="p-2 rounded bg-[var(--color-gris-oscuro)] border border-gray-700 outline-none" rows="4"></textarea>
                <button type="submit" className="bg-[var(--color-rosa)] text-gray-200 py-2 px-4 rounded hover:bg-[var(--color-rosa-hover)]">Enviar</button>
            </form>
        </section>
    )
}
export default Contact;