<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public channel - no authentication required
Broadcast::channel('towing-requests', function () {
    return true;
});

// Private channel example (if needed in future)
// Broadcast::channel('towing-request.{id}', function ($user, $id) {
//     return true; // Add your authorization logic here
// });
