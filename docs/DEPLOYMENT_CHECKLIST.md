# Deployment Checklist

## Configuration

- [ ] Production secrets configured through the hosting platform.
- [ ] Database configured and reachable.
- [ ] Frontend API URL points to the production API.
- [ ] AI provider credentials configured.

## Application

- [ ] Backend health endpoint responds.
- [ ] Authentication works.
- [ ] Resume editing and versioning work.
- [ ] JD extraction works.
- [ ] ATS analysis works.
- [ ] Tailoring works and preserves source versions.
- [ ] PDF compilation works.

## Security

- [ ] Debug settings disabled.
- [ ] Rate limiting considered/enabled.
- [ ] LaTeX compilation isolated.
- [ ] Uploaded documents are not exposed publicly.
- [ ] Secrets are not present in the repository.
