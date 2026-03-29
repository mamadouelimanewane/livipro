import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Hook générique de données avec fallback local
function useFetch(table, fallback = []) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rows, error: err } = await supabase.from(table).select('*').order('created_at', { ascending: false })
        if (err) throw err
        if (rows && rows.length > 0) {
          setData(rows)
          setIsFallback(false)
        } else {
          setIsFallback(true) // No data found, using fallback
        }
      } catch (e) {
        console.warn(`[LiviData] Fallback local pour '${table}':`, e.message)
        setError(e)
        setIsFallback(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [table])

  return { data, loading, error, isFallback }
}

// --- HOOKS MÉTIER SPÉCIALISÉS ---

export function useSocialFeed() {
  const LOCAL_FALLBACK = [
    { id: 'S1', author_name: 'Ministère du Commerce', text: '✅ COMMUNIQUÉ : Subvention sur le Sucre Local annoncée pour le Ramadan. Prix bloqués via LiviChain.', time: 'Il y a 10 min', likes: 542 },
    { id: 'S2', author_name: 'Grossiste Al-Amine', text: '🚚 ARRIVÉE MASSIVE : 500 sacs de Sucre St-Louis disponibles au Port. Prix préférentiel membres LiviPro.', time: 'Il y a 2h', likes: 24 },
    { id: 'S3', author_name: 'Système LiviPro', text: '⚠️ ALERTE TRAFIC : Zone Fass bloquée par travaux. Tournes DKR-9824 retardées de 30mn.', time: 'Il y a 4h', likes: 5 },
  ]
  return useFetch('social_feed', LOCAL_FALLBACK)
}

export function useMembers() {
  const LOCAL_FALLBACK = [
    { id: 'M1', type: 'institutional', name: 'Ministère du Commerce - Gouv SN', location: 'Dakar, Diamniadio', phone: '+221 33 800 00 00', rating: 5.0, status: 'Sponsor Officiel & Régulateur', karma: 9999 },
    { id: 'M2', type: 'wholesaler', name: 'Grossiste Al-Amine', location: 'Dakar Port, Zone B', phone: '+221 77 123 45 67', rating: 4.8, status: 'Certifié Platinum', karma: 980 },
    { id: 'M3', type: 'boutique', name: 'Supermarché Médina', location: 'Rue 10 x Blaise Diagne', phone: '+221 78 987 65 43', rating: 4.9, status: 'Hub Relais S1', karma: 942 },
    { id: 'M4', type: 'wholesaler', name: 'Diagne Distribution', location: 'Kaolack Marché Central', phone: '+221 76 543 21 09', rating: 4.7, status: 'Actif', karma: 850 },
    { id: 'M5', type: 'boutique', name: 'Alimentation Pikine', location: 'Bountou Pikine', phone: '+221 77 111 22 33', rating: 4.5, status: 'Sociétaire', karma: 720 },
    { id: 'M6', type: 'boutique', name: 'Boutique Podor Hub', location: 'Quartier Escale, Podor', phone: '+221 70 444 55 66', rating: 4.3, status: 'Relais S3', karma: 810 },
  ]
  return useFetch('members', LOCAL_FALLBACK)
}

export function useGroupageOffers() {
  const LOCAL_FALLBACK = [
    { id: 'GRP-001', name: 'Opération Bulk Riz Parfumé', min_orders: 10, current_orders: 8, discount: '20%', deadline: '6h restantes', status: 'Presque plein' },
    { id: 'GRP-002', name: 'Campagne Solidarité Sucre (Gouv SN)', min_orders: 50, current_orders: 42, discount: '35%', deadline: '15 jours', status: 'Soutenu par le Ministère' },
  ]
  return useFetch('groupage_offers', LOCAL_FALLBACK)
}

export function useProducts() {
  const LOCAL_FALLBACK = [
    { id: "p1", name: "Riz Parfumé Thai (Sac 50kg)", price: 21500, stock: 450, promo: false, category: "Céréales", wholesaler: "Grossiste Al-Amine", origin: "Importation - Port de Dakar", image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800" },
    { id: "p2", name: "Riz Brisé Local Casamance (Sac 50kg)", price: 18500, stock: 1200, promo: true, category: "Céréales", wholesaler: "Coopérative Rizicole Sédhiou", origin: "Production Locale 🇸🇳", image_url: "https://images.unsplash.com/photo-1613728913123-97d8331bec37?w=800" },
    { id: "p3", name: "Sucre Subventionné (Gouv SN)", price: 18000, stock: 5000, promo: true, category: "Soutien Étatique", wholesaler: "Ministère du Commerce", origin: "CSS", image_url: "https://images.unsplash.com/photo-1593710382375-48866177fc64?w=800" },
    { id: "p4", name: "Huile Dinor 20L", price: 28500, stock: 80, promo: true, category: "Alimentaire", wholesaler: "Dakar Port Hub", origin: "Importation", image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800" },
    { id: "p5", name: "Lait Nido (Carton 12)", price: 45000, stock: 210, promo: false, category: "Laitier", wholesaler: "Mboro Distribution", origin: "Nestlé Abidjan", image_url: "https://images.unsplash.com/photo-1550583724-125581cc2546?w=800" },
    { id: "p6", name: "Café Touba Artisanal (Lot 10kg)", price: 7500, stock: 140, promo: false, category: "Boissons", wholesaler: "Diagne Distribution", origin: "Touba 🇸🇳", image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800" },
    { id: "p7", name: "Pâtes Madar (Carton)", price: 12500, stock: 95, promo: false, category: "Alimentaire", wholesaler: "Ets Saliou", origin: "Turquie", image_url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800" },
    { id: "p8", name: "Savon Diama (Lot 24)", price: 6200, stock: 300, promo: false, category: "Entretien", wholesaler: "Dakar Port Hub", origin: "Sénégal 🇸🇳", image_url: "https://images.unsplash.com/photo-1584622781564-1d9876a13d1e?w=800" },
    { id: "p9", name: "Ciment SOCOCIM (Tonne)", price: 73000, stock: 200, promo: false, category: "BTP", wholesaler: "Ets Saliou", origin: "Rufisque 🇸🇳", image_url: "https://images.unsplash.com/photo-1518171052208-8db94050fc25?w=800" },
    { id: "p10", name: "Engrais NPK (Sac 50kg)", price: 32000, stock: 800, promo: true, category: "Agricole", wholesaler: "Ministère du Commerce", origin: "Programme National 🇸🇳", image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800" },
  ]
  return useFetch('products', LOCAL_FALLBACK)
}

export function useDeliveryTour() {
  const LOCAL_FALLBACK = {
    id: "TRN-DKR-9824",
    tour_code: "TRN-DKR-9824",
    driver_name: "Ousmane Diallo",
    total_stops: 8,
    completed_stops: 1,
    cash_collected: 1450000,
    fleet_roi: "27.500 FCFA",
    stops: [
      { id: 1, stop_order: 1, shop_name: "Boutique Serigne Saliou", address: "March\u00e9 Fass, Dakar", status: "completed", items_to_deliver: 25, expected_cash: 250000, lat: 14.6850, lng: -17.4582, ai_prediction: null },
      { id: 2, stop_order: 2, shop_name: "Supermarch\u00e9 Al-Amine", address: "Avenue Cheikh Anta Diop, Point E", status: "next", items_to_deliver: 60, expected_cash: 1200000, lat: 14.6928, lng: -17.4627, ai_prediction: "Ce partenaire a un Karma de 942. Il a r\u00e9duit ses commandes de Boissons Gaz\u00e9ifi\u00e9es de 15%. Proposez le d\u00e9stockage de la palette TRN-X1 (+5 cartons) avec remise Associ\u00e9." },
      { id: 3, stop_order: 3, shop_name: "Alimentation Ndiaye & Fils", address: "M\u00e9dina, Rue 6", status: "pending", items_to_deliver: 12, expected_cash: 85000, lat: 14.6796, lng: -17.4475, ai_prediction: null }
    ]
  }

  const [tour, setTour] = useState(LOCAL_FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        // Fetch the active tour
        const { data: tours, error: tourErr } = await supabase
          .from('delivery_tours')
          .select('*')
          .eq('status', 'En cours')
          .limit(1)

        if (tourErr) throw tourErr
        if (!tours || tours.length === 0) {
          setIsFallback(true) // No active tours found
          return
        }

        const activeTour = tours[0]

        // Fetch stops for this tour
        const { data: stops, error: stopsErr } = await supabase
          .from('delivery_stops')
          .select('*')
          .eq('tour_id', activeTour.id)
          .order('stop_order', { ascending: true })

        if (stopsErr) throw stopsErr

        setTour({
          ...activeTour,
          stops: stops || []
        })
        setIsFallback(false)
      } catch (e) {
        console.warn('[LiviData] Fallback local pour delivery_tours:', e.message)
        setError(e)
        setIsFallback(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [])

  return { data: tour, loading, error, isFallback }
}

// --- FONCTIONS DE MUTATION (ÉCRITURE) ---

export async function placeOrder(orderData, items) {
  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        buyer_id: orderData.buyer_id,
        seller_id: orderData.seller_id,
        total_amount: orderData.total_amount,
        status: 'pending',
        payment_method: orderData.payment_method || 'wave',
        payment_status: orderData.payment_status || 'pending',
        delivery_address: orderData.delivery_address
      }])
      .select()
      .single()

    if (orderErr) throw orderErr

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }))

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsErr) throw itemsErr

    return { success: true, order }
  } catch (e) {
    console.error('[LiviData] Erreur placeOrder:', e.message)
    return { success: false, error: e.message }
  }
}

export async function updateWalletBalance(memberId, amount, type = 'debit', description = '') {
  try {
    // 1. Get current balance
    const { data: member, error: fetchErr } = await supabase
      .from('members')
      .select('wallet_balance')
      .eq('id', memberId)
      .single()

    if (fetchErr) throw fetchErr

    const newBalance = type === 'debit' 
      ? Number(member.wallet_balance) - Number(amount)
      : Number(member.wallet_balance) + Number(amount)

    // 2. Update balance
    const { error: updateErr } = await supabase
      .from('members')
      .update({ wallet_balance: newBalance })
      .eq('id', memberId)

    if (updateErr) throw updateErr

    // 3. Record transaction
    await supabase.from('wallet_transactions').insert([{
      member_id: memberId,
      type,
      amount,
      balance_after: newBalance,
      description,
      status: 'completed'
    }])

    return { success: true, newBalance }
  } catch (e) {
    console.error('[LiviData] Erreur updateWallet:', e.message)
    return { success: false, error: e.message }
  }
}

// Hook pour écouter les nouvelles commandes (pour les Grossistes)
export function useRealtimeOrders(sellerId) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!sellerId) return

    // Initial fetch
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, buyer:members(name)')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
      if (data) setOrders(data)
    }
    fetchOrders()

    // Realtime subscription
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'orders',
        filter: `seller_id=eq.${sellerId}` 
      }, (payload) => {
        setOrders(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sellerId])

  return orders
}
