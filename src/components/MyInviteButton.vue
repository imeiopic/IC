<template>
  <button class="my-invite-btn" v-bind="$attrs">
    <img src="@assets/images/invite.png" alt="Invite" />
    <span>Invite</span>
  </button>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.my-invite-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
}
.my-invite-btn img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.my-invite-btn span {
  font-size: 1rem;
  color: #333;
  margin-top: 0.25rem;
}
</style>
