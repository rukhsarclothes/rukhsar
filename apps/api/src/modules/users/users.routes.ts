import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../common/middleware/auth";

const router = Router();

router.get("/", requireAuth, (request: AuthenticatedRequest, response) => {
  response.json({
    success: true,
    items: [
      {
        id: request.user?.id,
        email: request.user?.email,
        role: request.user?.role
      }
    ]
  });
});

export { router as usersRouter };
