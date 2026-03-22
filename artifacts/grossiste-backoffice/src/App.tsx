import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrossisteProvider } from "@/context/GrossisteContext";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/Dashboard";
import Chauffeurs from "@/pages/Chauffeurs";
import ChauffeurDetails from "@/pages/ChauffeurDetails";
import Boutiques from "@/pages/Boutiques";
import Produits from "@/pages/Produits";
import Tournees from "@/pages/Tournees";
import TourneeDetails from "@/pages/TourneeDetails";
import Livraisons from "@/pages/Livraisons";
import CreditFinance from "@/pages/CreditFinance";
import Intelligence from "@/pages/Intelligence";
import Notation from "@/pages/Notation";
import Rapports from "@/pages/Rapports";
import Carte from "@/pages/Carte";
import Commandes from "@/pages/Commandes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrossisteProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/chauffeurs" component={Chauffeurs} />
              <Route path="/chauffeurs/:id" component={ChauffeurDetails} />
              <Route path="/boutiques" component={Boutiques} />
              <Route path="/produits" component={Produits} />
              <Route path="/tournees" component={Tournees} />
              <Route path="/tournees/:id" component={TourneeDetails} />
              <Route path="/livraisons" component={Livraisons} />
              <Route path="/credit-finance" component={CreditFinance} />
              <Route path="/intelligence" component={Intelligence} />
              <Route path="/notation" component={Notation} />
              <Route path="/rapports" component={Rapports} />
              <Route path="/carte" component={Carte} />
              <Route path="/commandes" component={Commandes} />
              <Route>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <h2 className="text-4xl font-display font-bold text-slate-800 mb-2">404</h2>
                  <p className="text-slate-500">La page demandée est introuvable.</p>
                </div>
              </Route>
            </Switch>
          </Layout>
        </WouterRouter>
        <Toaster />
      </GrossisteProvider>
    </QueryClientProvider>
  );
}

export default App;
