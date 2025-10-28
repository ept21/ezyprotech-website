export default async function Landing({ params }) {
    // לעתיד: לטעון ACF גמיש של landing-page לפי slug/uri
    return (
        <main className="py-16">
            <div className="container">
                <h1 className="text-3xl font-bold">Landing: {params.slug}</h1>
                <p className="mt-4 text-gray-600">Scaffold — to be implemented with flexible ACF.</p>
            </div>
        </main>
    )
}
