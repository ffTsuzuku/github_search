import { Endpoints } from "@octokit/types"

type ListUserRepos = Endpoints['GET /users/{username}/repos']['response']
type ListOrgRepos = Endpoints['GET /orgs/{org}/repos']['response']
