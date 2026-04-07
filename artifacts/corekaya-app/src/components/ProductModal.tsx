import { X, Send } from "lucide-react";
import { Product, useCreateQuoteRequest } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in the ${product.name}. Please provide more information about pricing and availability.`,
  });

  const { toast } = useToast();
  const createQuote = useCreateQuoteRequest();

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuote.mutate({
      data: {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone || null,
        productId: product.id,
        productName: product.name,
        message: formData.message,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Quote Request Sent",
          description: "We'll be in touch with you shortly.",
        });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to send quote request. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        data-testid={`product-modal-${product.id}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-700 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="aspect-[4/3] w-full bg-gray-50 relative">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <span className="text-xs font-bold uppercase tracking-widest text-orange mb-2 block">
              {product.category}
            </span>
            <h2 className="font-serif text-2xl font-bold text-navy mb-2">
              {product.name}
            </h2>
            <p className="text-xl font-medium text-gray-900 mb-6">
              {product.priceDisplay}
            </p>
            
            <div className="prose prose-sm text-gray-600 mb-8">
              <p>{product.description}</p>
            </div>

            {showQuoteForm ? (
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 animate-in slide-in-from-bottom-4">
                <h3 className="font-medium text-navy mb-4">Request a Quote</h3>
                <form onSubmit={handleQuoteSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-navy"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-navy"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone (Optional)</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-navy"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-navy resize-none"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowQuoteForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="flex-1"
                      isLoading={createQuote.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={() => setShowQuoteForm(true)}
              >
                Get Quote
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}