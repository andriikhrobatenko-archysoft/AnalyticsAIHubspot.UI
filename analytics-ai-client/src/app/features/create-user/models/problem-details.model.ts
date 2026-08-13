/** Shape of ASP.NET Core's ValidationProblem()/ProblemDetails responses. */
export interface ProblemDetails {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
