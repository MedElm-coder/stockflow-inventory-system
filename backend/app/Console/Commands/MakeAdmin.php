<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'user:make-admin {email}';

    /**
     * The console command description.
     */
    protected $description = 'Promote an existing user to the admin role by email';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email: {$email}");
            return self::FAILURE;
        }

        $user->update(['role' => 'admin']);

        $this->info("{$user->name} ({$email}) is now an admin.");
        return self::SUCCESS;
    }
}