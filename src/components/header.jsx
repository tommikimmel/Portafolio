function Header(){
    return (
        <header className="bg-[var(--color-gris-oscuro)]/80 text-gray-200 p-6 flex justify-between items-center font-semibold shadow-md fixed w-full top-0 left-0 z-10 backdrop-blur-sm">
            <span className="text-xl"> Tomas Kimmel </span>
            <ul className="flex space-x-4">
                <li><a href="#" className="text-shadow-lg hover:text-gray-100 transition">Home</a></li>
                <li><a href="#" className="text-shadow-lg hover:text-gray-100 transition">About</a></li>
                <li><a href="#" className="text-shadow-lg hover:text-gray-100 transition">Projects</a></li>
                <li><a href="#" className="text-shadow-lg hover:text-gray-100 transition">Contact</a></li>
            </ul>
        </header>
    );  
}

export default Header;