type DeliveryPosition = {
  livraisonId: number;
  livreurId: number;
  latitude: number;
  longitude: number;
  precision?: number;
  vitesse?: number;
  cap?: number;
  updatedAt: string;
};

class GeolocationService {
  private deliveryPositions = new Map<number, DeliveryPosition>();

  updateDeliveryPosition(input: Omit<DeliveryPosition, 'updatedAt'>): DeliveryPosition {
    const position: DeliveryPosition = {
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.deliveryPositions.set(input.livraisonId, position);
    return position;
  }

  getDeliveryPosition(livraisonId: number): DeliveryPosition | null {
    return this.deliveryPositions.get(livraisonId) ?? null;
  }

  clearDeliveryPosition(livraisonId: number): void {
    this.deliveryPositions.delete(livraisonId);
  }

  calculerDistanceKm(
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number
  ): number {
    const rayonTerreKm = 6371;
    const dLat = this.toRad(latitudeB - latitudeA);
    const dLon = this.toRad(longitudeB - longitudeA);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(latitudeA)) *
        Math.cos(this.toRad(latitudeB)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return rayonTerreKm * c;
  }

  private toRad(value: number): number {
    return value * (Math.PI / 180);
  }
}

export const geolocationService = new GeolocationService();
