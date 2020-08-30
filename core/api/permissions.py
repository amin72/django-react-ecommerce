from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        """Allow owner to edit objects."""
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user == obj.user:
            return True
        return False
