<?php

namespace App\Events;

use App\Models\TowingRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TowingRequestCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $towingRequest;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\TowingRequest  $towingRequest
     * @return void
     */
    public function __construct(TowingRequest $towingRequest)
    {
        // Load relationships before broadcasting
        $this->towingRequest = $towingRequest->load(['customer', 'driver']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('towing-requests');
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'request.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'request' => $this->towingRequest,
            'message' => 'New towing request created',
        ];
    }
}
