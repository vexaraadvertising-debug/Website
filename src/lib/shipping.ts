/**
 * Abstract Shipping Service Layer
 * Designed to be provider-agnostic so it can easily swap between
 * Shiprocket, Delhivery, Blue Dart, etc., in the future.
 */

export interface ShippingDetails {
  orderId: string;
  weight: number; // in kg
  length: number; // in cm
  breadth: number;
  height: number;
  pickupPincode: string;
  deliveryPincode: string;
  paymentMethod: 'COD' | 'PREPAID';
}

export interface ShipmentResponse {
  success: boolean;
  awbNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  labelUrl?: string;
  error?: string;
}

export class ShippingService {
  private provider: string;

  constructor(provider: 'SHIPROCKET' | 'DELHIVERY' = 'SHIPROCKET') {
    this.provider = provider;
  }

  /**
   * Creates a shipment with the configured logistics provider.
   */
  async createShipment(details: ShippingDetails): Promise<ShipmentResponse> {
    console.log(`Creating shipment via ${this.provider} for Order: ${details.orderId}`);
    
    try {
      // Mock API call to logistics provider
      // In production: if (this.provider === 'SHIPROCKET') { return shiprocketApi.createOrder(...) }
      
      const mockAwb = `AWB${Math.floor(100000000 + Math.random() * 900000000)}`;
      
      return {
        success: true,
        awbNumber: mockAwb,
        courierName: this.provider === 'SHIPROCKET' ? 'Delhivery Surface' : 'Blue Dart',
        trackingUrl: `https://tracking.example.com/${mockAwb}`,
        labelUrl: `https://labels.example.com/${mockAwb}.pdf`
      };
    } catch (error) {
      console.error(`[ShippingService] Failed to create shipment:`, error);
      return { success: false, error: "Logistics API error" };
    }
  }

  /**
   * Syncs the current status of an AWB number.
   */
  async getStatus(awbNumber: string) {
    // Mock tracking status
    return {
      status: "IN_TRANSIT",
      location: "Bangalore Hub",
      timestamp: new Date().toISOString()
    };
  }
}
