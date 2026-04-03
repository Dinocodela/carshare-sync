import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, FileSignature, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CoHostAgreementModalProps {
  open: boolean;
  carId: string;
  carInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    vin_number: string;
    mileage: number;
  };
  ownerName?: string;
  onComplete: () => void;
}

export function CoHostAgreementModal({
  open,
  carId,
  carInfo,
  ownerName = "",
  onComplete,
}: CoHostAgreementModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signerName, setSignerName] = useState("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const threshold = 100;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      setHasScrolledToBottom(true);
    }
  }, []);

  const canSign = hasScrolledToBottom && signerName.trim().length >= 2;

  const handleSign = async () => {
    if (!user || !canSign) return;
    setIsSigning(true);
    try {
      const { error } = await (supabase as any)
        .from("signed_agreements")
        .insert({
          user_id: user.id,
          car_id: carId,
          agreement_version: "2025-v1",
          signer_name: signerName.trim(),
        });

      if (error) throw error;

      toast({
        title: "Agreement signed!",
        description: "Your co-host agreement has been recorded.",
      });
      onComplete();
    } catch (err: any) {
      console.error("Error signing agreement:", err);
      toast({
        title: "Error signing agreement",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSignature className="h-5 w-5 text-primary" />
            Co-Host Agreement
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Please read the entire agreement and sign below
          </p>
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto px-6 py-4"
          >
            <div className="prose prose-sm max-w-none text-foreground">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">Teslys LLC</h2>
                <p className="text-xs text-muted-foreground">
                  475 Washington Blvd, Marina Del Rey, CA 90292 • 310-463-6971 • support@Teslys.com
                </p>
              </div>

              <h3 className="text-center font-bold text-lg">CO-HOST AGREEMENT</h3>
              <p className="text-sm leading-relaxed">
                Co-host agreement (the "Agreement") is effective as of <strong>{today}</strong> and
                is made by and between Teslys LLC ("Teslys") and vehicle owner ("Owner"). Under the
                terms of this Agreement and Terms and Conditions of Teslys LLC located on the
                website www.Teslys.com, Owner agrees to transfer his vehicle ("Vehicle") to Teslys
                for management services. The Vehicle Owner hereby authorizes Teslys to list the
                vehicle on car-sharing platforms, such as Turo, and to manage all associated
                processes.
              </p>

              {/* Owner Info */}
              <div className="rounded-lg border bg-muted/30 p-4 my-4">
                <h4 className="font-semibold mb-2">OWNER</h4>
                <p className="text-sm">
                  <strong>Full Name:</strong> {ownerName || "—"}
                </p>
              </div>

              {/* Vehicle Info */}
              <div className="rounded-lg border bg-muted/30 p-4 my-4">
                <h4 className="font-semibold mb-2">VEHICLE</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Make:</strong> {carInfo.make}</p>
                  <p><strong>Model:</strong> {carInfo.model}</p>
                  <p><strong>Year:</strong> {carInfo.year}</p>
                  <p><strong>Color:</strong> {carInfo.color}</p>
                  <p><strong>License Plate:</strong> {carInfo.license_plate}</p>
                  <p><strong>VIN:</strong> {carInfo.vin_number}</p>
                  <p><strong>Mileage:</strong> {carInfo.mileage?.toLocaleString()}</p>
                </div>
              </div>

              {/* Teslys Obligations */}
              <h4 className="font-bold mt-6">TESLYS OBLIGATIONS</h4>
              <p className="text-sm">
                Teslys shall perform the following services in accordance with all applicable laws,
                regulations, and car sharing platforms policies:
              </p>
              <ul className="text-sm space-y-1">
                <li>Create and maintain listings for the Vehicle.</li>
                <li>Provide optimized pricing strategies designed to maximize Vehicle bookings.</li>
                <li>Provide guest and trip management services.</li>
                <li>Take pre-trip and post-trip photos and complete check-in and check-out requirements.</li>
                <li>Wash Vehicle before each trip.</li>
                <li>Handle all communication between car sharing platforms, guests, and third parties.</li>
                <li>Use vehicle for marketing and advertising purposes.</li>
                <li>Coordination of damage and insurance claims.</li>
                <li>Coordinate basic vehicle maintenance and repairs.</li>
                <li>Provide parking for the Vehicle.</li>
              </ul>

              {/* Owner Obligations & Vehicle Requirements */}
              <h4 className="font-bold mt-6">VEHICLE REQUIREMENTS</h4>
              <ul className="text-sm space-y-1">
                <li>Provide Vehicle in good working condition and that meets Teslys listing requirements.</li>
                <li>Arrange transportation of Vehicle to and from Teslys business location.</li>
                <li>Maintain minimum required state insurance for the Vehicle.</li>
                <li>Remit monthly applicable Vehicle financing or lease payments, if applicable.</li>
                <li>Remit payment and keep current annual Vehicle registration, including tax and title fees.</li>
                <li>Deliver Vehicle registration and stickers to Teslys within one week of receipt.</li>
                <li>Provide payment or reimbursement to Teslys for any and all costs associated with Vehicle maintenance, servicing, or repairs monthly unless deducted from Owner's earnings.</li>
              </ul>

              {/* Earnings */}
              <h4 className="font-bold mt-6">EARNINGS AND PAYMENT</h4>
              <p className="text-sm">
                Owner shall be entitled to receive their share of the gross rental revenue generated
                from the rental. Teslys shall have the right to retain its Management Fee from the
                monthly gross rental revenue. The gross rental revenue includes rental revenue,
                unlimited mileage extras, late return fees, additional usage fees.
              </p>
              <p className="text-sm">
                Gross rental revenue doesn't include cleaning fees, smoking fees, deep cleaning fees,
                delivery fees, or other extras provided to guests. Owner's share shall be paid
                monthly and calculated within 10 days following the end of the calendar month.
              </p>

              {/* Tickets & Fees */}
              <h4 className="font-bold mt-6">TICKETS AND FEES</h4>
              <p className="text-sm">
                Teslys will handle any fines or toll charges incurred during the reservations period.
                Teslys reserves the right to recover these costs from the guests linked to the
                booking at the time of the violations. Owners must report tickets or tolls at least
                one week prior to the due date. Teslys shall not be responsible for tickets and
                tolls incurred while the vehicle is in Owner's possession.
              </p>

              {/* Fees Table */}
              <h4 className="font-bold mt-6">FEES DEDUCTED FROM OWNER'S BALANCE</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-2 text-left font-semibold">Fee</th>
                      <th className="border p-2 text-left font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2"><strong>Service fee</strong> — oil/filter changes, tire, battery, glass replacement</td><td className="border p-2">$35 per service</td></tr>
                    <tr><td className="border p-2"><strong>Repair fee</strong> — engine, transmission, suspension, body, rims, etc.</td><td className="border p-2">$95 per service</td></tr>
                    <tr><td className="border p-2"><strong>Claim Processing</strong> — resolved with guest directly</td><td className="border p-2">$99 per claim</td></tr>
                    <tr><td className="border p-2"><strong>Claim Processing</strong> — resolved through Turo or EON</td><td className="border p-2">$149 per claim</td></tr>
                    <tr><td className="border p-2"><strong>Delivery fee</strong> — up to 15 miles, $5/extra mile</td><td className="border p-2">$75 one way</td></tr>
                    <tr><td className="border p-2"><strong>Parking fee</strong> — after 3rd day of maintenance without approval</td><td className="border p-2">$25/day</td></tr>
                    <tr><td className="border p-2"><strong>Convenience fee</strong> — services not in contract</td><td className="border p-2">$45</td></tr>
                    <tr><td className="border p-2"><strong>Expired registration/tags</strong></td><td className="border p-2">$100 + full trip amount</td></tr>
                    <tr><td className="border p-2"><strong>Trip cancellation</strong> — retrieval with upcoming reservations</td><td className="border p-2">$50 per canceled reservation</td></tr>
                    <tr><td className="border p-2"><strong>Guest reservation interference</strong></td><td className="border p-2">$100 + full trip amount</td></tr>
                    <tr><td className="border p-2"><strong>Police report fee</strong></td><td className="border p-2">$295</td></tr>
                    <tr><td className="border p-2"><strong>Tow yard recovery fee</strong></td><td className="border p-2">$195</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Parking */}
              <h4 className="font-bold mt-6">PARKING</h4>
              <p className="text-sm">
                Teslys provides complimentary secured parking between reservations. However, Teslys
                does not assume responsibility for the vehicle or any valuables therein while parked.
                Teslys is not responsible for fire, theft, damage or loss of the vehicle. We
                recommend removing all personal property before making the Vehicle available. If the
                owner fails to retrieve the vehicle within 24 hours after the scheduled pickup date,
                a parking fee may apply.
              </p>

              {/* Insurance */}
              <h4 className="font-bold mt-6">INSURANCE</h4>
              <p className="text-sm">
                Teslys explicitly disclaims any responsibility for providing insurance coverage for
                owners' vehicles. Insurance coverage may be obtained through Turo, another
                car-sharing company, or the renter's insurance policy. Owners are legally obligated
                to maintain the minimum required state insurance for each vehicle.
              </p>

              {/* Maintenance */}
              <h4 className="font-bold mt-6">MAINTENANCE</h4>
              <ul className="text-sm space-y-1">
                <li>The vehicle must be delivered fully serviced and ready for rentals.</li>
                <li>The owner must provide accurate information regarding the most recent service date.</li>
                <li>Teslys will manage routine maintenance tasks. Costs will be deducted from owner's balance along with a service fee.</li>
                <li>Ensuring the vehicle remains in a serviced condition is the responsibility of the Owner.</li>
              </ul>

              {/* Repairs */}
              <h4 className="font-bold mt-6">REPAIRS</h4>
              <ul className="text-sm space-y-1">
                <li>Owner must deliver the vehicle in good working condition, free from major defects.</li>
                <li>Teslys will coordinate and manage repairs. Owner authorizes repairs at Teslys partner facilities.</li>
                <li>Repairs not exceeding $300 will be undertaken without advance confirmation.</li>
                <li>Repairs exceeding $300 require owner's consent.</li>
                <li>Costs will be deducted from owner's balance along with the Repair fee.</li>
                <li>Owner reserves the right to perform repairs independently, provided they comply with all regulations.</li>
              </ul>

              {/* Claims */}
              <h4 className="font-bold mt-6">CLAIMS</h4>
              <p className="text-sm">
                All Turo trips include coverage under Turo's Vehicle Protection Plan with a $2,500
                deductible (90 plan). The owner agrees their vehicle will be covered by the "90
                plan."
              </p>
              <ul className="text-sm space-y-1">
                <li>For claims exceeding $2,500, Teslys covers the deductible upon resolution through Turo (not for total loss).</li>
                <li>Claims below $2,500 may be settled directly with the guest to avoid the deductible.</li>
                <li>If claim is less than $2,500, Teslys will partially cover up to $2,000 in case of Turo resolution.</li>
                <li>Teslys covers the deductible only if the car is repaired at Teslys' partner facilities.</li>
                <li>Owner authorizes Teslys to handle the entire claim resolution process.</li>
                <li>All documents and invoices related to claims can be provided upon written request to claims@Teslys.com.</li>
                <li>If the vehicle is declared a total loss, Teslys will inform the Owner within 72 hours.</li>
              </ul>
              <p className="text-sm">
                Owner bears full responsibility for claims if the vehicle was inoperable, lacked
                registration, or lacked insurance at the time of the incident. Teslys is not
                responsible for pre-existing damage or damage while in owner's possession.
              </p>

              {/* Uncovered Damages */}
              <h4 className="font-bold mt-6">UNCOVERED DAMAGES & WEAR AND TEAR</h4>
              <p className="text-sm">
                Normal wear and tear is expected. No reimbursement for interior and exterior wear
                and tear. Exterior wear: any dings, dents, cracks, or scratches 3 inches or less.
                Teslys is not responsible for headlight fogging, tires, battery, brake pads, shocks,
                struts, belts, hoses, and spark plugs.
              </p>
              <p className="text-sm">
                Owner consents to sharing the vehicle with unlimited mileage. Teslys shall not be
                held responsible for any decrease in vehicle value due to mileage.
              </p>

              {/* Vehicle Return */}
              <h4 className="font-bold mt-6">VEHICLE RETURN</h4>
              <p className="text-sm">
                <strong>Minimum Placement Term:</strong> 30 days. After this period, Owner may
                request vehicle return provided there are no reservations within the next 30 days.
                Trip Cancellation Fee applies for each canceled trip. Owners must schedule an
                appointment with Teslys to retrieve their vehicle. Vehicle will undergo inspection.
                If insurance-covered damage is found, Teslys may retain the vehicle until repairs
                are completed.
              </p>

              {/* Clean title */}
              <div className="rounded-lg border bg-muted/30 p-4 my-6">
                <p className="text-sm font-semibold">
                  By signing below, I confirm that my car has a clean title.
                </p>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground animate-bounce pointer-events-auto">
                <ChevronDown className="h-4 w-4" />
                Scroll to read the full agreement
              </div>
            </div>
          )}
        </div>

        {/* Signature section */}
        <div className="border-t px-6 py-4 flex-shrink-0 space-y-3 bg-muted/30">
          <div>
            <label className="text-sm font-medium text-foreground">
              Type your full legal name to sign
            </label>
            <Input
              placeholder="Your full name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="mt-1.5"
              disabled={!hasScrolledToBottom}
            />
            {!hasScrolledToBottom && (
              <p className="text-xs text-muted-foreground mt-1">
                Please scroll through the entire agreement first
              </p>
            )}
          </div>
          <Button
            onClick={handleSign}
            disabled={!canSign || isSigning}
            className="w-full"
            size="lg"
          >
            {isSigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <FileSignature className="h-4 w-4 mr-2" />
                I Agree & Sign
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
