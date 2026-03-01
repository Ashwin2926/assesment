<?php

namespace App\Events;

use App\Models\TowingRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TowingRequestStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $towingRequest;
    public $oldStatus;
    public $newStatus;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\TowingRequest  $towingRequest
     * @param  string  $oldStatus
     * @param  string  $newStatus
     * @return void
     */
    public function __construct(TowingRequest $towingRequest, $oldStatus, $newStatus)
    {
        $this->towingRequest = $towingRequest->load(['customer', 'driver']);
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
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
        return 'request.status.changed';
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
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => "Request status changed from {$this->oldStatus} to {$this->newStatus}",
        ];
    }
}
