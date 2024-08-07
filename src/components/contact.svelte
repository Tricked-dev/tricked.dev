<script lang="ts">
  import PocketBase from "pocketbase";
  import { POCKETBASE_URL } from "../config";
  import { onMount } from "svelte";
  let pb: PocketBase;

  onMount(async () => {
    pb = new PocketBase(POCKETBASE_URL);
  });

  const data = {
    name: "",
    email: "",
    message: "",
    phone: "",
    bot: true,
  };
</script>

<form
  id="contact"
  class="my-4 mb-8"
  on:submit|preventDefault={async () => {
    await pb.collection("messages").create(data);
    window.alert("Successfully sent message");
    window.location.reload();
  }}
>
  <div class="flex gap-3">
    <div class="form-control">
      <label class="label" for="name">
        <span class="label-text">Name</span>
      </label>
      <input
        class="input input-bordered"
        type="text"
        id="name"
        name="name"
        required
        minlength="3"
        bind:value={data.name}
      />
    </div>
    <div class="form-control">
      <label class="label" for="email">
        <span class="label-text">Email</span>
      </label>
      <input
        class="input input-bordered"
        type="email"
        id="email"
        name="email"
        required
        minlength="3"
        bind:value={data.email}
      />
    </div>
    <div class="form-control">
      <label class="label" for="phone">
        <span class="label-text">Phone</span>
      </label>
      <input
        class="input input-bordered"
        type="text"
        id="phone"
        name="phone"
        pattern={"[7-9]{1}[0-9]{9}"}
        bind:value={data.phone}
      />
    </div>
  </div>

  <div class="form-control">
    <label class="label" for="message">
      <span class="label-text">Message</span>
    </label>
    <textarea
      class="textarea textarea-bordered"
      id="message"
      name="message"
      required
      minlength="1"
      bind:value={data.message}
    />
  </div>
  <div class="flex gap-4 my-2">
    <div class="form-control flex gap-2 flex-row">
      <label class="label" for="bot">
        <span class="label-text">I am a bot</span>
      </label>
      <input
        id="bot"
        type="checkbox"
        class="checkbox checkbox-primary my-auto"
        bind:checked={data.bot}
      />
    </div>
    <button type="submit" class="btn btn-primary mt-auto">Submit</button>
  </div>
</form>
