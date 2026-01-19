export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">D</span>
                            </div>
                            <span className="font-bold text-lg text-white">DigiInvite</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Creating beautiful moments in the digital world. The best platform for your invitation needs.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Templates</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Tutorials</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} DigiInvite. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
