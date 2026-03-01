<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TowingRequest;
use App\Events\TowingRequestCreated;
use App\Events\TowingRequestStatusChanged;
use App\Events\TowingRequestAccepted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TowingRequestController extends Controller
{
    /**
     * Display a listing of towing requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && $user->user_type === 'driver') {
            // Drivers can see all requests
            $requests = TowingRequest::with(['customer', 'driver'])
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user && $user->user_type === 'customer') {
            // Customers can see their own requests
            $requests = TowingRequest::with(['customer', 'driver'])
                ->where('customer_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
                  
            $requests = TowingRequest::with(['customer', 'driver'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Store a newly created towing request in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'location' => 'required|string|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'note' => 'nullable|string',
        ]);

     
        $validated['customer_id'] = $request->user() ? $request->user()->id : null;
        $validated['status'] = 'pending'; // Default status

        $towingRequest = TowingRequest::create($validated);

        // Load relationships for the response
        $towingRequest->load(['customer', 'driver']);

      
        event(new TowingRequestCreated($towingRequest));

        Log::info('Towing request created', ['request_id' => $towingRequest->id]);

        return response()->json([
            'success' => true,
            'message' => 'Towing request created successfully',
            'data' => $towingRequest,
        ], 201);
    }

    /**
     * Display the specified towing request.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $towingRequest = TowingRequest::with(['customer', 'driver'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $towingRequest,
        ]);
    }

    /**
     * Accept a towing request by a driver.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function accept(Request $request, $id)
    {
        $user = $request->user();

        // Ensure the authenticated user is a driver
        if (!$user || $user->user_type !== 'driver') {
            return response()->json([
                'success' => false,
                'message' => 'Only drivers can accept requests',
            ], 403);
        }

        $towingRequest = TowingRequest::findOrFail($id);

        // Check if the request is still pending
        if ($towingRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been ' . $towingRequest->status,
            ], 400);
        }

        $oldStatus = $towingRequest->status;
 
        $towingRequest->update([
            'driver_id' => $user->id,
            'status' => 'assigned',
        ]);

   
        $towingRequest->load(['customer', 'driver']);

 
        event(new TowingRequestAccepted($towingRequest));
        event(new TowingRequestStatusChanged($towingRequest, $oldStatus, 'assigned'));

        Log::info('Towing request accepted', [
            'request_id' => $towingRequest->id,
            'driver_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request accepted successfully',
            'data' => $towingRequest,
        ]);
    }

    /**
     * Update the status of a towing request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,assigned,in_progress,completed,cancelled',
        ]);

        $towingRequest = TowingRequest::findOrFail($id);
        $oldStatus = $towingRequest->status;
        $newStatus = $validated['status'];

        // Update the status
        $towingRequest->update(['status' => $newStatus]);

  
        $towingRequest->load(['customer', 'driver']);

 
        event(new TowingRequestStatusChanged($towingRequest, $oldStatus, $newStatus));

        Log::info('Towing request status updated', [
            'request_id' => $towingRequest->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request status updated successfully',
            'data' => $towingRequest,
        ]);
    }
}
