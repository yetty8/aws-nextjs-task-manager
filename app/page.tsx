import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Header />
      <section className="text-center mt-20">
        <h1 className="text-4xl font-bold mb-4">AWS Next.js Project</h1>
        <p className="text-lg text-gray-700">
          Full-stack cloud application deployed with AWS Amplify.
        </p>
      </section>
      <Footer />
    </main>
  );
}
